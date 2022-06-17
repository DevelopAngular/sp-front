import { Component, OnInit, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef, TemplateRef} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {tap, take, filter, finalize} from 'rxjs/operators';

type VisibilityMode = 'visible_all_students' | 'visible_certain_students' | 'hidden_certain_students';
type ModeSetting = {text: string, classname: string};
type ModeSettings = Record<VisibilityMode, ModeSetting>;
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

  // option element has been selected
  @Output() optionSelectedEvent: EventEmitter<string> = new EventEmitter<string>();

  // reason the component exists for
  // value that has meaning for database
  mode: VisibilityMode = 'visible_all_students';
  // text representing selected mode
  modeSetting: ModeSetting;
 // options as they exists in database as IDs
  // with their displaying texts in view 
  private modes: ModeSettings = {
    'visible_all_students': {text: 'Show room for all students', classname: 'visibility-all'},
    'visible_certain_students': {text: 'Show room for certain students', classname: 'visibility-allow'},
    'hidden_certain_students': {text: 'Hide room for certain students', classname: 'visibility-denny'},
  };

  tooltipText: string = 'Change room visibility';

  // did open the panel with options 
  didOpen: boolean = false;

  constructor(
    public dialog: MatDialog,
  ) {
    this.modeSetting = this.modes[this.mode];
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
      filter( v => !!v),
      tap(v => {
        this.updateMode(v);
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
    this.modeSetting = this.modes[option['key']];
    // notify parent of selected option
    this.optionSelectedEvent.emit(option['key']);
  }

  private positionPanelDialog() {
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
