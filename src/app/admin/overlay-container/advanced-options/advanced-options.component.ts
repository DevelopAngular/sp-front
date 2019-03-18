import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { User } from '../../../models/User';

export interface OptionState {
    now: {
        state: string;
        data: {
            selectedTeachers: User[];
            any_teach_assign: string;
            all_teach_assign: string;
        };
    };
    future: {
        state: string;
        data: {
            selectedTeachers: User[];
            any_teach_assign: string;
            all_teach_assign: string;
        }
    };
}

@Component({
  selector: 'app-advanced-options',
  templateUrl: './advanced-options.component.html',
  styleUrls: ['./advanced-options.component.scss']
})
export class AdvancedOptionsComponent implements OnInit {

  @Input() roomName: string;
  @Input() nowRestricted: boolean;
  @Input() futureRestricted: boolean;

  @Output() hideBottomBlock: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() resultOptions: EventEmitter<OptionState> = new EventEmitter<OptionState>();

  openedContent: boolean;
  hideFutureBlock: boolean;
  isActiveTooltip: boolean;

  toggleChoices = [
      'Any teacher (default)',
      'Any teachers assigned',
      'All teachers assigned',
      'Certain teacher(s)'
  ];

  optionState: OptionState = {
      now: {
          state: this.toggleChoices[0],
          data: {
              selectedTeachers: [],
              any_teach_assign: null,
              all_teach_assign: null,
          }
      },
      future: {
          state: this.toggleChoices[0],
          data: {
              selectedTeachers: [],
              any_teach_assign: null,
              all_teach_assign: null,
          }
      }
  };

  constructor() { }

  ngOnInit() {
  }

  toggleContent() {
    this.openedContent = !this.openedContent;
  }

  changeState(action, data) {
    switch (action) {
        case 'now_teacher':
          this.optionState.now.data.selectedTeachers = data;
          break;
        case 'future_teacher':
          this.optionState.future.data.selectedTeachers = data;
          break;
        case 'now_any':
          this.optionState.now.data.any_teach_assign = data;
          break;
        case 'now_all':
          this.optionState.now.data.all_teach_assign = data;
          break;
        case 'future_any':
          this.optionState.future.data.any_teach_assign = data;
          break;
        case 'future_all':
          this.optionState.future.data.all_teach_assign = data;
          break;
    }
    this.resultOptions.emit(this.optionState);
  }

  hideEmit(event: boolean) {
    this.hideBottomBlock.emit(event);
  }

}
