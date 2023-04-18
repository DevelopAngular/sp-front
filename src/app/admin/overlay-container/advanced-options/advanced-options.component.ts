import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { User } from '../../../models/User';
import { bumpIn } from '../../../animations';
import { DarkThemeSwitch } from '../../../dark-theme-switch';
import { DomSanitizer } from '@angular/platform-browser';
import { cloneDeep, isEqual } from 'lodash';
import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { OverlayDataService, RoomData, TooltipText } from '../overlay-data.service';
import { takeUntil } from 'rxjs/operators';
import { FeatureFlagService, FLAGS } from '../../../services/feature-flag.service';

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
		};
	};
	from?: string;
	fromEnabled?: boolean;
	to?: string;
	toEnabled?: boolean;
	needsCheckIn?: boolean;
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
	animations: [bumpIn],
})
export class AdvancedOptionsComponent implements OnInit, OnDestroy {
	@Input() roomName: string;
	@Input() nowRestricted: boolean;
	@Input() ignoreStudentsPassLimit: boolean;
	@Input() futureRestricted: boolean;
	@Input() disabledOptions: string[];
	@Input() data: OptionState;
	@Input() resetOptions$: Subject<OptionState>;
	@Input() roomData: RoomData;
	@Input() passLimitForm: FormGroup;
	@Input() showErrors: boolean;
	@Input() allowChangingIgnoreStudentsPassLimit: boolean;
	@Input() allowChangingShowAsOriginRoom: boolean;

	@Output() openedOptions: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() resultOptions: EventEmitter<{ options: OptionState; validButtons: ValidButtons }> = new EventEmitter<{
		options: OptionState;
		validButtons: ValidButtons;
	}>();
	@Output() nowRestrEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() futureRestEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() checkInEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() ignoreStudentsPassLimitEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() showAsOriginRoomEmit: EventEmitter<boolean> = new EventEmitter<boolean>();

	public hideFutureBlock: boolean;
	public tooltipText: TooltipText;
	public openNowOptions: boolean;
	public openFutureOptions: boolean;

	public limitInputsFocus: {
		to: boolean;
		from: boolean;
	} = { to: false, from: false };

	public restrictionForm: FormGroup;

	public toggleChoices = ['Any teacher', 'Any teachers in room', 'All teachers in room', 'Certain \n teachers'];

	public optionState: OptionState;
	private initialState: OptionState;

	public selectedOpt;

	private isShowButtons: ValidButtons = {
		publish: null,
		incomplete: null,
		cancel: null,
	};

	public change$: Subject<any> = new Subject<any>();
	private destroy$: Subject<any> = new Subject<any>();

	constructor(
		public darkTheme: DarkThemeSwitch,
		private sanitizer: DomSanitizer,
		private fb: FormBuilder,
		private overlayService: OverlayDataService,
		private featureService: FeatureFlagService
	) {}

	get isWaitInLine(): boolean {
		return this.featureService.isFeatureEnabled(FLAGS.WaitInLine);
	}

	public ngOnInit(): void {
		this.tooltipText = this.overlayService.tooltipText;
		this.optionState = cloneDeep(this.data);
		this.initialState = cloneDeep({
			...this.optionState,
			...this.passLimitForm.value,
		});
		this.resetOptions$.subscribe((data) => {
			this.optionState = cloneDeep(data);
		});
		this.buildData();

		this.passLimitForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((res) => {
			this.checkValidOptions();
			this.resultOptions.emit({
				options: {
					...this.optionState,
					...res,
				},
				validButtons: this.isShowButtons,
			});
		});

		this.restrictionForm = new FormGroup({
			forNow: new FormControl(this.roomData.restricted),
			forFuture: new FormControl(this.roomData.scheduling_restricted),
			checkIn: new FormControl(this.roomData.needs_check_in),
			countsTowardsPassLimits: new FormControl(!this.roomData.ignore_students_pass_limit),
			showAsOriginRoom: new FormControl(this.roomData.show_as_origin_room),
		});

		this.futureRestEmit.emit(this.roomData.scheduling_restricted);
		this.nowRestrEmit.emit(this.roomData.restricted);
		this.checkInEmit.emit(this.roomData.needs_check_in);
		this.ignoreStudentsPassLimitEmit.emit(this.roomData.ignore_students_pass_limit);

		this.change$.pipe(takeUntil(this.destroy$)).subscribe(({ value, action }) => {
			this.limitInputsFocus[action] = value;
			if (this.limitInputsFocus[action]) {
				this.passLimitForm.get(action).setValue('');
			}
		});
	}

	public ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private buildData(): void {
		this.selectedOpt = {
			anyNow: this.optionState.now.data.any_teach_assign,
			anyFut: this.optionState.future.data.any_teach_assign,
			allNow: this.optionState.now.data.all_teach_assign,
			allFut: this.optionState.future.data.all_teach_assign,
			nowTeachers: this.optionState.now.data.selectedTeachers,
			futTeachers: this.optionState.future.data.selectedTeachers,
		};
	}

	public changeState(action: string, data: User[] | string): void {
		switch (action) {
			case 'now_teacher':
				this.optionState.now.data.selectedTeachers = data as User[];
				break;
			case 'future_teacher':
				this.optionState.future.data.selectedTeachers = data as User[];
				break;
			case 'now_any':
				this.optionState.now.data.any_teach_assign = data as string;
				break;
			case 'now_all':
				this.optionState.now.data.all_teach_assign = data as string;
				break;
			case 'future_any':
				this.optionState.future.data.any_teach_assign = data as string;
				break;
			case 'future_all':
				this.optionState.future.data.all_teach_assign = data as string;
				break;
		}
		this.checkValidOptions();
		this.resultOptions.emit({ options: this.optionState, validButtons: this.isShowButtons });
	}

	public changeOptions(action, option): void {
		if (action === 'now' && this.optionState.now.state !== option) {
			this.optionState.now.data = { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] };
			this.optionState.now.state = option;
		} else if (action === 'future' && this.optionState.future.state !== option) {
			this.optionState.future.data = { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] };
			this.optionState.future.state = option;
		}
		this.buildData();
		this.checkValidOptions();
		this.resultOptions.emit({ options: this.optionState, validButtons: this.isShowButtons });
	}

	private checkValidOptions(): void {
		const now = this.optionState.now;
		const future = this.optionState.future;
		if (
			(now.state === 'Any teachers in room' && !now.data.any_teach_assign) ||
			(future.state === 'Any teachers in room' && !future.data.any_teach_assign) ||
			(now.state === 'All teachers in room' && !now.data.all_teach_assign) ||
			(future.state === 'All teachers in room' && !future.data.all_teach_assign) ||
			(now.state === 'Certain \n teachers' && !now.data.selectedTeachers.length) ||
			(future.state === 'Certain \n teachers' && !future.data.selectedTeachers.length) ||
			this.passLimitForm.dirty
		) {
			if (!isEqual(this.initialState, { ...this.optionState, ...this.passLimitForm.value })) {
				this.isShowButtons = {
					publish: false,
					incomplete: true,
					cancel: true,
				};
				if (this.passLimitForm.value.from || this.passLimitForm.value.to) {
					if (
						this.passLimitForm.value.toEnabled &&
						!this.passLimitForm.value.to &&
						this.passLimitForm.get('to').invalid
						// (this.passLimitForm.value.from && (this.passLimitForm.value.toEnabled && !this.passLimitForm.value.to) || this.passLimitForm.get('from').invalid) ||
						// (this.passLimitForm.value.to && (this.passLimitForm.value.fromEnabled && !this.passLimitForm.value.from) || this.passLimitForm.get('from').invalid)
					) {
						this.isShowButtons = {
							publish: false,
							incomplete: true,
							cancel: true,
						};
					} else {
						this.isShowButtons = {
							publish: true,
							incomplete: false,
							cancel: true,
						};
					}
				}
			} else {
				this.isShowButtons = {
					publish: false,
					incomplete: false,
					cancel: false,
				};
			}
		} else {
			if (isEqual(this.initialState, { ...this.optionState, ...this.passLimitForm.value })) {
				this.isShowButtons = {
					publish: false,
					incomplete: false,
					cancel: false,
				};
			} else {
				this.isShowButtons = {
					publish: true,
					incomplete: false,
					cancel: true,
				};
			}
		}
	}

	public nowEvent(value: boolean): void {
		this.nowRestrEmit.emit(value);
	}

	public futureEvent(value: boolean): void {
		this.futureRestEmit.emit(value);
	}

	public checkInEvent(value: boolean): void {
		this.checkInEmit.emit(value);
	}

	public ignoreStudentsPassLimitEvent(value: boolean): void {
		this.ignoreStudentsPassLimitEmit.emit(!value);
	}

	public showAsOriginRoomEvent(value: boolean): void {
		this.showAsOriginRoomEmit.emit(value);
	}

	public isRestrictionEmpty(restriction: string): boolean {
		if (!this.showErrors) return;

		if (restriction === 'now') {
			if (this.optionState.now.state === this.toggleChoices[3]) return this.optionState.now.data.selectedTeachers.length === 0;
		} else if (this.optionState.future.state === this.toggleChoices[3]) return this.optionState.future.data.selectedTeachers.length === 0;
	}
}
