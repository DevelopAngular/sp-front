import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../../models/User';
import { bumpIn } from '../../../animations';
import { DarkThemeSwitch } from '../../../dark-theme-switch';
import { DomSanitizer } from '@angular/platform-browser';

import * as _ from 'lodash';

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
  styleUrls: ['./advanced-options.component.scss'],
  animations: [bumpIn]
})
export class AdvancedOptionsComponent implements OnInit {

  @Input() roomName: string;
  @Input() nowRestricted: boolean;
  @Input() futureRestricted: boolean;

  @Input() data: OptionState;

  @Output() hideBottomBlock: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() resultOptions: EventEmitter<OptionState> = new EventEmitter<OptionState>();

  openedContent: boolean;
  hideFutureBlock: boolean;
  isActiveTooltip: boolean;

  toggleChoices = [
      'Any teacher (default)',
      'Any teachers assigned',
      'All teachers assigned',
      'Certain \n teacher(s)'
  ];

  optionState: OptionState;

  selectedOpt;

  hovered: boolean;
  pressed: boolean;

  constructor(
      public darkTheme: DarkThemeSwitch,
      private sanitizer: DomSanitizer
  ) { }

  get bgColor() {
      if (this.hovered) {
          if (this.pressed) {
              return this.sanitizer.bypassSecurityTrustStyle('#E2E7F4');
          } else {
                return this.sanitizer.bypassSecurityTrustStyle('#ECF1FF');
          }
      } else {
          return this.sanitizer.bypassSecurityTrustStyle('transparent');
      }
    }

  ngOnInit() {
          this.optionState = _.cloneDeep(this.data);
          this.buildData();
  }

  buildData() {
      this.selectedOpt = {
          anyNow: this.optionState.now.data.any_teach_assign,
          anyFut: this.optionState.future.data.any_teach_assign,
          allNow: this.optionState.now.data.all_teach_assign,
          allFut: this.optionState.future.data.all_teach_assign,
          nowTeachers: this.optionState.now.data.selectedTeachers,
          futTeachers: this.optionState.future.data.selectedTeachers,
      };
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

  changeOptions(action, option) {
      if (action === 'now' && this.optionState.now.state !== option) {
        this.optionState.now.data = {all_teach_assign: null, any_teach_assign: null, selectedTeachers: []};
        this.optionState.now.state = option;
      } else if (action === 'future' && this.optionState.future.state !== option) {
        this.optionState.future.data = {all_teach_assign: null, any_teach_assign: null, selectedTeachers: []};
        this.optionState.future.state = option;
      }
      this.buildData();
      this.resultOptions.emit(this.optionState);

  }

}
