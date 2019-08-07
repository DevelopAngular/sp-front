import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../../models/User';
import { bumpIn } from '../../../animations';
import { DarkThemeSwitch } from '../../../dark-theme-switch';
import { DomSanitizer } from '@angular/platform-browser';

import * as _ from 'lodash';
import {Subject} from 'rxjs';

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

export interface ValidButtons {
    publish: boolean;
    incomplete: boolean;
    cancel: boolean;
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
    @Input() disabledOptions: string[];
    @Input() data: OptionState;
    @Input() resetOptions$: Subject<OptionState>;

    @Output() openedOptions: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() resultOptions: EventEmitter<{options: OptionState, validButtons: ValidButtons}> = new EventEmitter<{options: OptionState, validButtons: ValidButtons}>();

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

    initialState: OptionState;

    selectedOpt;

    isShowButtons: ValidButtons = {
        publish: null,
        incomplete: null,
        cancel: null
    };

    hovered: boolean;
    pressed: boolean;

    constructor(
        public darkTheme: DarkThemeSwitch,
        private sanitizer: DomSanitizer
    ) {
    }

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
        this.initialState = _.cloneDeep(this.optionState);
        this.resetOptions$.subscribe(data => {
          this.optionState = _.cloneDeep(data);
        });
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
        this.openedOptions.emit(this.openedContent);
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
        this.checkValidOptions();
        this.resultOptions.emit({options: this.optionState, validButtons: this.isShowButtons});
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
        this.checkValidOptions();
        this.resultOptions.emit({options: this.optionState, validButtons: this.isShowButtons});

    }

    checkValidOptions() {
        // console.log('Chack ==>>', this.optionState);
        const now = this.optionState.now;
        const future = this.optionState.future;
        if (
            (now.state === 'Any teachers assigned' && !now.data.any_teach_assign) ||
            (future.state === 'Any teachers assigned' && !future.data.any_teach_assign) ||
            (now.state === 'All teachers assigned' && !now.data.all_teach_assign) ||
            (future.state === 'All teachers assigned' && !future.data.all_teach_assign) ||
            (now.state === 'Certain \n teacher(s)' && !now.data.selectedTeachers.length) ||
            (future.state === 'Certain \n teacher(s)' && !future.data.selectedTeachers.length)
        ) {
            if (!_.isEqual(this.initialState, this.optionState)) {
                this.isShowButtons = {
                    publish: false,
                    incomplete: true,
                    cancel: true
                };
            } else {
                this.isShowButtons = {
                    publish: false,
                    incomplete: false,
                    cancel: false
                };
            }
        } else {
            if (_.isEqual(this.initialState, this.optionState)) {
                this.isShowButtons = {
                    publish: false,
                    incomplete: false,
                    cancel: false
                };
            } else {
                this.isShowButtons = {
                    publish: true,
                    incomplete: false,
                    cancel: true
                };
            }
        }
    }
}
