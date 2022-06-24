import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {tap, take, takeUntil, filter, finalize} from 'rxjs/operators';

import {User} from '../../../models/User';
import {SPSearchComponent} from '../../../sp-search/sp-search.component'; 
import {VisibilityMode, ModeView, ModeViewMap, VisibilityOverStudents, DEFAULT_VISIBILITY_STUDENTS} from './visibility-room.type';

@Component({
  selector: 'app-visibility-room',
  templateUrl: './visibility-room.component.html',
  styleUrls: ['./visibility-room.component.scss']
})
export class VisibilityRoomComponent implements OnInit, AfterViewInit, OnDestroy {

  // element who trigger the opening and closing of options panel 
  @ViewChild('opener') openerRef: ElementRef<HTMLElement>;
  // it contains options to choose from
  @ViewChild('panel') panelRef: TemplateRef<any>;
  // access to search component public methods: cancel, etc
  @ViewChild(SPSearchComponent) searchComponent: SPSearchComponent;
  
  @Input() data: VisibilityOverStudents = DEFAULT_VISIBILITY_STUDENTS; 

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
    'visible_all_students': {text: 'Show room for all students', classname: 'visibility-all'},
    'visible_certain_students': {text: 'Show room for certain students', classname: 'visibility-allow'},
    'hidden_certain_students': {text: 'Hide room for certain students', classname: 'visibility-denny'},
  };

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
  ) {
    this.modeView = this.modes[this.mode];
  }

  ngOnInit(): void {
    // don't trigger an output  event
    this.updateData(this.data);

    /*this.visibilityForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((v: {visibility: VisibilityOverStudents}) =>  {
      this.checkValidVisibility({visibility: v})
    });
    
    checkValidVisibility(v: VisibilityOverStudents) {
      console.log('ility', v);
      this.visibilityForm.dirty;
    }*/

    this.change$.pipe(
      takeUntil(this.destroy$),
      tap(() => this.visibilityChange())
    ).subscribe();
  }

  ngAfterViewInit() {
    if (this.selectedStudents.length > 0) {
      this.searchComponent.inputField = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateData(data: VisibilityOverStudents) {
    this.updateMode(data.mode);
    this.addFoundStudents(data.over);
  }

  private panelDialog: MatDialogRef<TemplateRef<any>> | undefined;

  handleOpenClose(evt) {
    const PANEL_ID =  'opener-visibility-options';

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
        this.updateMode(v);
        this.resetSearchComponent();
      }),
      finalize(() => {
        this.didOpen = false;
        this.panelDialog = undefined;
      }),
    ).subscribe();
  }

  handleModeSelected(modefromview: VisibilityMode): void {
    // hide options panel
    this.panelDialog.close(modefromview);
  }

  private updateMode(mode: VisibilityMode): void {
    // posible previous found students
    this.selectedStudents = [];
    this.mode = mode;
    this.modeView = this.modes[mode];
  }

  public addFoundStudents(found: User[]) {
    // not found - we add only found students
    if (!found.length) return; 

    this.selectedStudents = found; 
    this.change$.next();
  }

  public visibilityChange() {
    // prepare data for external use
    this.data = {mode: this.mode, over: this.selectedStudents};
    this.visibilityForm.setValue({visibility: this.data});
    // notify parent of selected option
    this.optionSelectedEvent.emit(this.data);
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
