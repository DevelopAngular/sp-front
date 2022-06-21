import { Component, OnInit, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {tap, take, filter, finalize} from 'rxjs/operators';

import {User} from '../../../models/User';
import {SPSearchComponent} from '../../../sp-search/sp-search.component'; 

type VisibilityMode = 'visible_all_students' | 'visible_certain_students' | 'hidden_certain_students';
type ModeView = {text: string, classname: string};
type ModeViews = Record<VisibilityMode, ModeView>;
type Option<T> = {key: VisibilityMode, value: T};

@Component({
  selector: 'app-visibility-room',
  templateUrl: './visibility-room.component.html',
  styleUrls: ['./visibility-room.component.scss']
})
export class VisibilityRoomComponent implements OnInit {

  // element who trigger the opening and closing of options panel 
  @ViewChild('opener') openerRef: ElementRef<HTMLElement>;
  // it contains options to choose from
  @ViewChild('panel') panelRef: TemplateRef<any>;
  // access to search component public methods: cancel, etc
  @ViewChild(SPSearchComponent) searchComponent: SPSearchComponent;

  // option element has been selected
  @Output() optionSelectedEvent: EventEmitter<string> = new EventEmitter<string>();

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
  private modes: ModeViews = {
    'visible_all_students': {text: 'Show room for all students', classname: 'visibility-all'},
    'visible_certain_students': {text: 'Show room for certain students', classname: 'visibility-allow'},
    'hidden_certain_students': {text: 'Hide room for certain students', classname: 'visibility-denny'},
  };

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

  ngOnInit(): void {}

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
      filter( v => !!v && (v.key !== this.mode)),
      tap(v => {
        this.updateMode(v);
        this.resetSearchComponent();
      }),
      finalize(() => {
        this.didOpen = false;
        this.panelDialog = undefined;
      }),
    ).subscribe();

  }

  handleOptionSelected(option: Option<string>): void {
    // hide options panel
    this.panelDialog.close(option);
  }

  private updateMode(option: Option<string>): void {
    this.mode = option['key'];
    this.modeView = this.modes[option['key']];
    // notify parent of selected option
    this.optionSelectedEvent.emit(option['key']);
  }

  // call public method cancel of the search component
  // used inside VisibilityRoom  template
  public resetSearchComponent() {
    //TODO use setTimeout to check next js loop 
    // the presence of searchComponent 
    // how britle is this solution?
    setTimeout(() => {
      if (!this.searchComponent) return;
      this.searchComponent.removeStudents();
      this.searchComponent.inputField = true;
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
