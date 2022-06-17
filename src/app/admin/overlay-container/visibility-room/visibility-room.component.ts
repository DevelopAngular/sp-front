import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';

type VisibilityMode = 'visible_all_students' | 'visible_certain_students' | 'hidden_certain_students';
type ModeTexts = Record<VisibilityMode, string>;
type Option<T> = {key: VisibilityMode, value: T};

@Component({
  selector: 'app-visibility-room',
  templateUrl: './visibility-room.component.html',
  styleUrls: ['./visibility-room.component.scss']
})
export class VisibilityRoomComponent implements OnInit {

  // element who trigger the opening and closing of options panel 
  @ViewChild('opener') opener: ElementRef<HTMLElement>;
  // option element has been selected
  @Output() optionSelectedEvent: EventEmitter<string> = new EventEmitter<string>();

  // reason the component exists for
  // value that has meaning for database
  mode: VisibilityMode = 'visible_all_students';
  // text representing selected mode
  modeText: string;
 // options as they exists in database as IDs
  // with their displaying texts in view 
  private modes: ModeTexts = {
    'visible_all_students': 'Show room for all students',
    'visible_certain_students': 'Show room for certain students',
    'hidden_certain_students': 'Hide room for certain students',
  };

  tooltipText: string = 'Change room visibility';

  // class associated with selected element
  classname: string;
  
  // did open the panel with options 
  didOpen: boolean = false;

  constructor() {
    this.modeText = this.modes[this.mode];
  }

  ngOnInit(): void {}

  handleOpenClose(evt) {
    console.log(evt)
    // show/close options panel
  }

  handleOptionSelected(option: Option<string>) {
    this.modeText = option.value;
    // hide options panel
    // notify parent of selected option
    this.optionSelectedEvent.emit(option.key);
  }

}
