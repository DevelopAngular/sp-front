import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../../models/User';
import { bumpIn } from '../../../animations';
import { DarkThemeSwitch } from '../../../dark-theme-switch';
import { DomSanitizer } from '@angular/platform-browser';
import { cloneDeep, isEqual } from 'lodash';
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {OverlayDataService} from '../overlay-data.service';

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
    from?: string;
    fromEnabled?: boolean;
    to?: string;
    toEnabled?: boolean;
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
    @Output() nowRestrEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() futureRestEmit: EventEmitter<boolean> = new EventEmitter<boolean>();

    openedContent: boolean;
    hideFutureBlock: boolean;
    isActiveTooltip: boolean;
    tooltipText;
    openNowOptions: boolean;
    openFutureOptions: boolean;

    mockAPCForm: FormGroup;
    restrictionForm: FormGroup;

    toggleChoices = [
        'Any teacher',
        'Any teachers in room',
        'All teachers in room',
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

    change$: Subject<any> = new Subject<any>();

    constructor(
        public darkTheme: DarkThemeSwitch,
        private sanitizer: DomSanitizer,
        private fb: FormBuilder,
        private overlayService: OverlayDataService
    ) {
      this.mockAPCForm = this.fb.group({
        fromEnabled: [false],
        from: [''],
        toEnabled: [false],
        to: ['']
      });
      this.restrictionForm = this.fb.group({
        forNow: [],
        forFuture: []
      });
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
        this.tooltipText = this.overlayService.tooltipText;
        this.optionState = cloneDeep(this.data);
        this.initialState = cloneDeep({
          ...this.optionState,
          ...this.mockAPCForm.value
        });
        this.resetOptions$.subscribe(data => {
          this.optionState = cloneDeep(data);
        });
        this.buildData();
        this.mockAPCForm.valueChanges.subscribe(res => {
          if (!res.fromEnabled && res.from !== '') {
            this.mockAPCForm.get('from').setValue('');
          }
          if (!res.toEnabled && res.to !== '') {
            this.mockAPCForm.get('to').setValue('');
          }
          this.checkValidOptions();
          this.resultOptions.emit({options: this.optionState, validButtons: this.isShowButtons});
        });
        this.futureRestEmit.emit(false);
        this.nowRestrEmit.emit(false);
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

    formValidation() {
      if (this.mockAPCForm.dirty && this.initialState.fromEnabled !== this.mockAPCForm.value.fromEnabled) {
        if (this.mockAPCForm.value.fromEnabled) {
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
      }
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
        const now = this.optionState.now;
        const future = this.optionState.future;
        if (
            (now.state === 'Any teachers in room' && !now.data.any_teach_assign) ||
            (future.state === 'Any teachers in room' && !future.data.any_teach_assign) ||
            (now.state === 'All teachers in room' && !now.data.all_teach_assign) ||
            (future.state === 'All teachers in room' && !future.data.all_teach_assign) ||
            (now.state === 'Certain \n teacher(s)' && !now.data.selectedTeachers.length) ||
            (future.state === 'Certain \n teacher(s)' && !future.data.selectedTeachers.length ||
            this.mockAPCForm.dirty )
        ) {
            if (!isEqual(this.initialState, {...this.optionState, ...this.mockAPCForm.value})) {
                this.isShowButtons = {
                    publish: false,
                    incomplete: true,
                    cancel: true
                };
                if (this.mockAPCForm.value.from || this.mockAPCForm.value.to) {
                  if (
                    (this.mockAPCForm.value.from && (this.mockAPCForm.value.toEnabled && !this.mockAPCForm.value.to)) ||
                    (this.mockAPCForm.value.to && (this.mockAPCForm.value.fromEnabled && !this.mockAPCForm.value.from))
                  ) {
                    this.isShowButtons = {
                      publish: false,
                      incomplete: true,
                      cancel: true
                    };
                  } else {
                    this.isShowButtons = {
                      publish: true,
                      incomplete: false,
                      cancel: true
                    };
                  }
                }
            } else {
                this.isShowButtons = {
                    publish: false,
                    incomplete: false,
                    cancel: false
                };
            }
        } else {
            if (isEqual(this.initialState, {...this.optionState, ...this.mockAPCForm.value})) {
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

    nowEvent(value) {
      this.nowRestrEmit.emit(value);
    }

    futureEvent(value) {
      this.futureRestEmit.emit(value);
    }
}
