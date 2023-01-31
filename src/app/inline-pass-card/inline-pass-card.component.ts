import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HallPass } from '../models/HallPass';
import { HttpService } from '../services/http-service';
import { DataService } from '../services/data-service';
import { interval, merge, Observable, of } from 'rxjs';
import { filter, map, pluck } from 'rxjs/operators';
import { HallPassesService } from '../services/hall-passes.service';
import { TimeService } from '../services/time.service';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { MatDialog } from '@angular/material/dialog';
import { ScreenService } from '../services/screen.service';
import { StorageService } from '../services/storage.service';
import { DeviceDetection } from '../device-detection.helper';
import { Navigation } from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import { Pinnable } from '../models/Pinnable';
import { User } from '../models/User';
import { RecurringSchedulePassService } from '../services/recurring-schedule-pass.service';
import { RecurringConfig } from '../models/RecurringFutureConfig';

@Component({
	selector: 'app-inline-pass-card',
	templateUrl: './inline-pass-card.component.html',
	styleUrls: ['./inline-pass-card.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlinePassCardComponent implements OnInit, OnDestroy {
	@Input() pass: HallPass;
	@Input() isActive: boolean = false;
	@Input() forInput: boolean = false;
	@Input() fromPast: boolean = false;
	@Input() forFuture: boolean = false;
	@Input() isOpenBigPass: boolean;
	@Input() fullScreen: boolean;

	timeLeft: string = '';
	valid: boolean = true;
	returnData: any = {};
	overlayWidth: string = '0px';
	buttonWidth: number = 288;
	isExpiring: boolean;
	recurringConfig: RecurringConfig;

	selectedDuration: number;
	selectedTravelType: string;
	subscribers$;
	endPassLoading$: Observable<boolean>;
	activeRoomCodePin: boolean;
	activeTeacherPin: boolean;
	activeTeacherSelection: boolean;
	selectedTeacher: User;

	public FORM_STATE: Navigation;
	pinnable: Pinnable;

	constructor(
		private http: HttpService,
		private dataService: DataService,
		private hallPassService: HallPassesService,
		private timeService: TimeService,
		private shortcutsService: KeyboardShortcutsService,
		private dialog: MatDialog,
		private screen: ScreenService,
		private storage: StorageService,
		private cdr: ChangeDetectorRef,
		private recurringConfigService: RecurringSchedulePassService
	) {}

	get gradient() {
		return 'radial-gradient(circle at 73% 71%, ' + this.pass.color_profile.gradient_color + ')';
	}

	get isMobile() {
		return DeviceDetection.isMobile();
	}

	get isRecurringFuture() {
		return !!this.pass?.schedule_config_id;
	}

	ngOnInit() {
		this.endPassLoading$ = this.hallPassService.startPassLoading$;
		if (JSON.parse(this.storage.getItem('pass_full_screen')) && !this.fullScreen) {
			setTimeout(() => {
				this.openBigPassCard();
			}, 10);
		}
		this.subscribers$ = merge(of(0), interval(1000))
			.pipe(
				map((x) => {
					if (!!this.pass && this.isActive) {
						const end: Date = this.pass.expiration_time;
						const now: Date = this.timeService.nowDate();
						const diff: number = (end.getTime() - now.getTime()) / 1000;
						const mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
						const secs: number = Math.abs(Math.floor(diff) % 60);
						this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
						this.valid = end > now;

						const start: Date = this.pass.start_time;
						const dur: number = Math.floor((end.getTime() - start.getTime()) / 1000);
						this.overlayWidth = this.buttonWidth * (diff / dur) + 'px';
						this.isExpiring = Date.now() > this.pass.expiration_time.getTime();
						return x;
					}
				})
			)
			.subscribe(() => {
				this.cdr.detectChanges();
			});

		this.shortcutsService.onPressKeyEvent$
			.pipe(
				filter(() => !this.isMobile),
				pluck('key')
			)
			.subscribe((key) => {
				if (key[0] === 'e') {
					this.endPass();
				}
			});

		this.FORM_STATE = {
			step: null,
			previousStep: 0,
			state: 1,
			fromState: null,
			formMode: {
				role: null,
				formFactor: null,
			},
			data: {
				selectedGroup: null,
				selectedStudents: [],
				direction: {
					from: null,
				},
				roomStudents: null,
			},
			forInput: false,
			forLater: false,
			kioskMode: false,
		};

		this.pinnable = this.FORM_STATE.data.direction ? this.FORM_STATE.data.direction.pinnable : null;

		if (this.pass?.schedule_config_id) {
			this.recurringConfigService.getRecurringScheduledConfig(this.pass.schedule_config_id).subscribe({
				next: (c) => (this.recurringConfig = c),
			});
		}
	}

	ngOnDestroy() {
		this.subscribers$.unsubscribe();
		this.closeDialog();
	}

	endPass() {
		if (this.pass.needs_check_in) {
			this.activeRoomCodePin = true;
		} else {
			this.hallPassService.endPassRequest(this.pass.id);
		}
	}

	roomCodeResult(event) {
		console.log('event : ', event);
	}

	enableTeacherPin() {
		this.activeRoomCodePin = false;
		this.activeTeacherPin = true;
		this.activeTeacherSelection = false;
	}

	selectTeacher() {
		this.activeRoomCodePin = false;
		this.activeTeacherPin = false;
		this.activeTeacherSelection = true;
	}

	requestTarget(teacher) {
		this.enableTeacherPin();
		this.selectedTeacher = teacher;
	}

	back() {
		if (this.activeTeacherPin == true) {
			this.activeTeacherPin = false;
			this.activeRoomCodePin = false;
			this.activeTeacherSelection = true;
		} else if (this.activeTeacherSelection == true) {
			this.activeRoomCodePin = true;
			this.activeTeacherPin = false;
			this.activeTeacherSelection = false;
		} else {
			this.activeRoomCodePin = false;
			this.activeTeacherPin = false;
			this.activeTeacherSelection = false;
		}
	}

	closeDialog() {
		this.screen.closeDialog();
	}

	openBigPassCard() {
		this.storage.setItem('pass_full_screen', !this.isOpenBigPass);
		this.screen.openBigPassCard(this.isOpenBigPass, this.pass, 'inlinePass');
	}
}
