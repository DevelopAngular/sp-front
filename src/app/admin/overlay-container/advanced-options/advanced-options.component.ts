import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {User} from '../../../models/User';

export interface OptionState {
    state: string;
    data: {
      selectedTeachers: User[];
    };
}

@Component({
  selector: 'app-advanced-options',
  templateUrl: './advanced-options.component.html',
  styleUrls: ['./advanced-options.component.scss']
})
export class AdvancedOptionsComponent implements OnInit {

  @Output() hideBottomBlock: EventEmitter<boolean> = new EventEmitter<boolean>();

  openedContent: boolean;

  toggleChoices = [
      'Any teacher (default)',
      'Any teachers assigned',
      'All teachers assigned',
      'Certain teacher(s)'
  ];

  optionState: OptionState = {
      state: this.toggleChoices[0],
      data: {
          selectedTeachers: []
      }
  };

  constructor() { }

  ngOnInit() {
  }

  toggleContent() {
    this.openedContent = !this.openedContent;
  }

  changeState(action, data) {
    if (action === 'teacher') {
      this.optionState.data.selectedTeachers = data;
    }
  }

  hideEmit(event: boolean) {
    this.hideBottomBlock.emit(event);
  }

}
