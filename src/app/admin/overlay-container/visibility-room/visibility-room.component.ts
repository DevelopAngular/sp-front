import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, TemplateRef, Renderer2} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {tap, take, takeUntil, filter, finalize} from 'rxjs/operators';
import {cloneDeep} from 'lodash';

import {User} from '../../../models/User';
import {SPSearchComponent} from '../../../sp-search/sp-search.component'; 
import {VisibilityMode, ModeView, ModeViewMap, VisibilityOverStudents, DEFAULT_VISIBILITY_STUDENTS} from './visibility-room.type';
import {OverlayDataService} from '../overlay-data.service';
import {slideOpacity } from '../../../animations';

@Component({
  selector: 'app-visibility-room',
  templateUrl: './visibility-room.component.html',
  styleUrls: ['./visibility-room.component.scss'],
  animations: [slideOpacity],
})
export class VisibilityRoomComponent implements OnInit, AfterViewInit, OnDestroy {

  // element who trigger the opening and closing of options panel 
  @ViewChild('opener') openerRef: ElementRef<HTMLElement>;
  // it contains options to choose from
  @ViewChild('panel') panelRef: TemplateRef<any>;
  // access to search component public methods: cancel, etc
  @ViewChild(SPSearchComponent) searchComponent: SPSearchComponent;
  
  @Input() data?: VisibilityOverStudents = DEFAULT_VISIBILITY_STUDENTS; 

  @Input() showErrors: boolean
  showErrorsVisibility: boolean = false;

  @Input() visibilityForm: FormGroup;

  // option element has been selected
  @Output('onVisibilityChange') optionSelectedEvent: EventEmitter<VisibilityOverStudents> = new EventEmitter<VisibilityOverStudents>();

  // reasons the component exists for
  // 1) the students to be subject of visibility room rule
  selectedStudents: User[] = [];
  // related setting to search component
  showOptions = false;
  // 2) how visibility room rule will operate - value that has meaning for database
  mode: VisibilityMode = 'visible_all_students';
  // text representing selected mode
  modeView: ModeView;
 // options as they exists in database as IDs
  // with their displaying texts in view 
  private modes: ModeViewMap = {
    'visible_all_students': {text: 'All students', textmenu: 'Show room for all students', classname: 'visibility-all'},
    'visible_certain_students': {text: 'Show for certain students', textmenu: 'Show room for certain students',  classname: 'visibility-allow'},
    'hidden_certain_students': {text: 'Hide for certain students', textmenu: 'Hide room for certain students', classname: 'visibility-denny'},
  };
  private asIs = () => 0;

  // keeps previous changes
  private prevdata: Partial<{[key in Exclude<VisibilityMode, 'visible_all_students'>]: VisibilityOverStudents}> = {};

  private change$ = new Subject();
  destroy$ = new Subject();

  tooltipText: string = 'Change room visibility';

  // did open the panel with options 
  didOpen: boolean = false;

  // need to show the search UI?
  get isShowSearch(): boolean {
   return this.mode !== 'visible_all_students';
  }

  constructor(
    public dialog: MatDialog,
    public overlayService: OverlayDataService,
    private renderer: Renderer2,
  ) {
    this.modeView = this.modes[this.mode];
  }

  ngOnInit(): void {
    if (!this.data) {
      this.data = this.overlayService.pageState.getValue().data?.visibility ?? DEFAULT_VISIBILITY_STUDENTS;
    }
    this.mode = this.data.mode;
    this.modeView = this.modes[this.data.mode];
    this.selectedStudents = this.data.over; 
    // keep last non-all data
    this.updatePrevData();

    this.change$.pipe(
      takeUntil(this.destroy$),
      tap(() => this.visibilityChange())
    ).subscribe();
  }

  unlisten: () => void;

  ngAfterViewInit() {
    if (this.selectedStudents.length > 0) {
      this.searchComponent.inputField = false;
    }
    // TODO: it assumes that div.right-button exists in the upper componet's hierachy
    this.unlisten = this.renderer.listen('document', 'click', event => {
      const $el = event.target.closest('div.right-button');
      // click on that button allows errors to be shown
      if (!!$el) {
        this.showErrorsVisibility = true;
        return;
      }
      this.showErrorsVisibility = false;
    });
  }
  // the focus of internal input native of app-search
  // triggers this method in order to hide the errors 
  public onSearchComponentFocus() {
    this.showErrorsVisibility = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.unlisten();
  }

  private panelDialog: MatDialogRef<TemplateRef<any>> | undefined;

  private dirty: boolean;

  handleOpenClose() {
    const PANEL_ID = 'opener-visibility-options';

    const panelDialogExists = this.dialog.getDialogById(PANEL_ID);
    if (panelDialogExists) return;

    const conf = {
      id: PANEL_ID,
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
    };
    this.panelDialog = this.dialog.open(this.panelRef, conf);
    this.positionPanelDialog();
    this.didOpen = true;

    this.panelDialog.afterClosed()
    .pipe(
      take(1),
      filter( (v: VisibilityMode | null) => !!v && (v !== this.mode)),
      tap((v: VisibilityMode) => {
        // init new mode
        this.selectedStudents = [];
        this.mode = v;
        this.modeView = this.modes[v];
        if (!this.prevdata[v]) {
          this.resetSearchComponent();
        } else {
          this.setSearchComponent(this.prevdata[v].over);
        }
      }),
      finalize(() => {
        this.didOpen = false;
        this.panelDialog = undefined;
        // component is untouched
        this.dirty = false;
      }),
    ).subscribe();
  }

  handleModeSelected(modefromview: VisibilityMode): void {
    // hide options panel
    this.panelDialog.close(modefromview);
  }

  public addFoundStudents(found: User[]) {
    this.dirty = true;
    this.selectedStudents = found; 
    this.change$.next();
  }

  public visibilityChange() {
    // prepare data for external use
    this.data = {mode: this.mode, over: this.selectedStudents};
    
    // sync with page state
    this.overlayService.patchData({data: this.data});

    this.visibilityForm.setValue({visibility: this.data});
    // notify parent of selected option
    this.optionSelectedEvent.emit(this.data);

    // keep last modification
    this.updatePrevData();

    // no data? shows the search input
    if (this.data.over.length === 0 && !!this.searchComponent) {
      setTimeout(() => this.searchComponent.inputField = true, 0);
    }
  }

  private updatePrevData(data: VisibilityOverStudents | null = null) {
    if (data === null) data = this.data;
    
    if (data.mode === 'visible_all_students') return;

    this.prevdata = {
      ...this.prevdata,
      [data.mode]: {
        mode: data.mode, 
        over: cloneDeep(data.over),
      }
    };
  }

  // call public method cancel of the search component
  // used inside VisibilityRoom  template
  public resetSearchComponent() {
    //TODO use setTimeout to check next js loop 
    // the presence of searchComponent 
    // how britle is this solution?
    setTimeout(() => {
      if (this.searchComponent) {
        // remove students;s chips from UI
        this.searchComponent.removeStudents();
        this.searchComponent.inputField = true;
      }
      this.change$.next();
    }, 0);
  }

  public setSearchComponent(ss: User[]) {
    setTimeout(() => {
      this.selectedStudents = ss;
      this.searchComponent.inputField = (ss.length === 0);
      this.change$.next();
    }, 0);
  }

  private positionPanelDialog() {
    // input search should exists
    const $rect = this.openerRef.nativeElement;
    const rect = $rect.getBoundingClientRect();
    // bottom right related to opener
    const position = {
      top: (rect.bottom) + 'px', 
      // 270 is taken from CSS not live calculated
      left: rect.left + (rect.width - 270) + 'px', 
    };
    this.panelDialog.updatePosition(position)
  }
}
