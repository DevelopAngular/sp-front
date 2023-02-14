import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	Optional,
	Output,
	ViewChild,
} from '@angular/core';
import { User } from '../models/User';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HallPass } from '../models/HallPass';

import {
	bumpIn,
	ResizeProfileImage,
	resizeStudentPasses,
	scaleStudentPasses,
	showHideProfileEmail,
	studentPassFadeInOut,
	topBottomProfileName,
} from '../animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { DomCheckerService } from '../services/dom-checker.service';
import { PassLike } from '../models';
import { HallPassesService } from '../services/hall-passes.service';
import { QuickPreviewPasses } from '../models/QuickPreviewPasses';
import { filter, map, take, tap } from 'rxjs/operators';
import { DeviceDetection } from '../device-detection.helper';
import * as moment from 'moment';
import { EncounterPreventionService } from '../services/encounter-prevention.service';
import { ExclusionGroup } from '../models/ExclusionGroup';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { TimeService } from '../services/time.service';
import { ReportFormComponent } from '../report-form/report-form.component';
import { KioskModeService } from '../services/kiosk-mode.service';
import { UNANIMATED_CONTAINER } from '../consent-menu-overlay';
import { SettingsDescriptionPopupComponent } from '../settings-description-popup/settings-description-popup.component';
import { CreateHallpassFormsComponent } from '../create-hallpass-forms/create-hallpass-forms.component';
import { WaitingInLinePass } from '../models/WaitInLine';

@Component({
	selector: 'app-student-passes',
	templateUrl: './student-passes.component.html',
	styleUrls: ['./student-passes.component.scss'],
	animations: [ResizeProfileImage, showHideProfileEmail, topBottomProfileName, scaleStudentPasses, resizeStudentPasses, studentPassFadeInOut, bumpIn],
})
export class StudentPassesComponent implements OnInit, OnDestroy, AfterViewInit {
	@Input() profile: User;
	@Input() height: number = 75;
	@Input() isResize: boolean = true;
	@Input() pass: PassLike;
	@Input() hasProfilePicture: boolean = true;

	@Output() close = new EventEmitter();
	@Output() destroyClose = new EventEmitter();

	@ViewChild('profileImage') profileImage: ElementRef;

	lastStudentPasses: Observable<HallPass[]>;

	isStaff: boolean; // for staff the passes have a richer UI
	extraSpace: number = 50; // space we need for staff UI
	isWaitInLine: boolean;

	isScrollable: boolean;
	animationTrigger = { value: 'open', params: { size: '75' } };
	scaleCardTrigger$: Observable<string>;
	resizeTrigger$: Subject<'open' | 'close'> = new Subject<'open' | 'close'>();
	resizeTriggerParams$: Observable<{ value: 'open' | 'close'; params: { height: number } }>;
	fadeInOutTrigger$: Observable<string>;
	isOpenEvent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	loading$: Observable<boolean>;
	loaded$: Observable<boolean>;
	passesStats$: Observable<QuickPreviewPasses>;
	exclusionGroups$: Observable<ExclusionGroup[]>;

	hovered: boolean;
	pressed: boolean;
	headerInfoHover: boolean;

	user$: Observable<User>;

	destroy$: Subject<any> = new Subject<any>();
	kioskModeRoom$ = this.kioskMode.getCurrentRoom();

	@HostListener('document.scroll', ['$event'])
	scroll(event) {
		if (event.currentTarget.scrollTop >= 50) {
			this.isScrollable = true;
			this.animationTrigger = { value: 'close', params: { size: '42' } };
		} else {
			this.isScrollable = false;
			this.animationTrigger = { value: 'open', params: { size: '75' } };
		}
	}

	constructor(
		private dialog: MatDialog,
		@Optional() private dialogRef: MatDialogRef<PassCardComponent>,
		private domCheckerService: DomCheckerService,
		private passesService: HallPassesService,
		private encounterPreventionService: EncounterPreventionService,
		private router: Router,
		private userService: UserService,
		private timeService: TimeService,
		private kioskMode: KioskModeService
	) {}

	ngAfterViewInit() {
		if (!this.isResize) {
			this.domCheckerService.fadeInOutTrigger$.next('fadeIn');
		}
	}

	ngOnInit() {
		this.isWaitInLine = this.pass instanceof WaitingInLinePass;
		this.user$ = this.userService.user$.pipe(map((u) => User.fromJSON(u)));
		this.fadeInOutTrigger$ = this.domCheckerService.fadeInOutTrigger$;
		this.passesService.getQuickPreviewPassesRequest(this.profile.id, true);
		this.encounterPreventionService.getExclusionGroupsForStudentRequest(this.profile.id);
		this.scaleCardTrigger$ = this.domCheckerService.scalePassCard;
		this.lastStudentPasses = this.passesService.quickPreviewPasses$.pipe(map((passes) => passes.map((pass) => HallPass.fromJSON(pass))));
		this.loading$ = this.passesService.quickPreviewPassesLoading$;
		this.loaded$ = this.passesService.quickPreviewPassesLoaded$;
		this.passesStats$ = this.passesService.quickPreviewPassesStats$;
		this.exclusionGroups$ = this.encounterPreventionService.exclusionGroupsForStudents$.pipe(
			filter((g) => !!g[this.profile.id]),
			map((groups) => {
				return groups[this.profile.id].reduce((acc, group) => {
					return [...acc, { ...group, users: group.users.filter((u) => +u.id !== +this.profile.id) }];
				}, []);
			})
		);

		this.resizeTriggerParams$ = this.resizeTrigger$.pipe(
			map((s: 'open' | 'close') => {
				const h = s === 'open' ? 475 : 75;
				const args = {
					value: s,
					params: {
						height: this.extraSpace + h,
					},
				};
				return args;
			})
		);

		this.user$
			.pipe(
				take(1),
				map((user) => {
					const isStaff =
						user.roles.includes('_profile_teacher') || user.roles.includes('_profile_admin') || user.roles.includes('_profile_assistant');
					return isStaff;
				}),
				tap((isStaff) => {
					this.isStaff = isStaff;
					if (!this.kioskModeRoom$.value && !this.isWaitInLine) {
						this.height += this.extraSpace;
					}
				})
			)
			.subscribe();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	isActivePass(pass: HallPass) {
		return moment().isBefore(moment(pass.end_time));
	}

	get isLongName() {
		return this.profile.display_name.length > 20;
	}

	get isOpen() {
		return this.isOpenEvent$.getValue() || !this.isResize;
	}

	get isClose() {
		return !this.isOpenEvent$.getValue() && this.isResize;
	}

	get isMobile() {
		return DeviceDetection.isMobile();
	}

	getBg() {
		/*if (this.hovered && !this.isOpen) {
      if (this.pressed) {
        return '#EAEDF1';
      }
      return '#F0F2F5';
    }*/
		return '#FFFFFF';
	}

	openProfile() {
		this.pressed = false;
		if (this.isClose && this.isResize) {
			this.resizeTrigger$.next('open');
			this.domCheckerService.scalePassCardTrigger$.next('resize');
			this.isOpenEvent$.next(true);
		}
	}

	openStudentInfoPage() {
		this.router.navigate([`/main/student/${this.profile.id}`]);
		this.dialogRef.close();
	}

	closeProfile(event) {
		if (this.isOpen && this.isResize) {
			event.stopPropagation();
			this.animationTrigger = { value: 'open', params: { size: '75' } };
			this.resizeTrigger$.next('close');
			this.isOpenEvent$.next(false);
			this.domCheckerService.scalePassCardTrigger$.next('unresize');
		}
	}

	get isIOSTablet() {
		return DeviceDetection.isIOSTablet();
	}

	preparePassData(pass) {
		const now = this.timeService.nowDate();
		now.setSeconds(now.getSeconds() + 10);

		pass = Object.assign({}, pass);
		let data: any = {};
		let fromPast = false;
		let forFuture = false;
		let isActive = false;
		let forStaff = true;
		let forMonitor = false;

		if (pass instanceof HallPass) {
			data = {
				pass,
				fromPast: pass['end_time'] < now,
				forFuture: pass['start_time'] > now,
				forMonitor: forMonitor,
				forStaff: forStaff && !this.kioskMode.getCurrentRoom().value,
				kioskMode: !!this.kioskMode.getCurrentRoom().value,
				//hideReport: this.isAdminPage,
				//activePassTime$: this.activePassTime$,
				showStudentInfoBlock: !this.kioskMode.getCurrentRoom().value,
			};
			data.isActive = !data.fromPast && !data.forFuture;
		} else {
			data = {
				pass,
				fromPast,
				forFuture,
				forMonitor,
				isActive,
				forStaff,
			};
		}

		return data;
	}

	openReport(event, pass: PassLike) {
		event.stopPropagation();
		const passData = this.preparePassData(pass);
		const isHallPass = pass instanceof HallPass;
		const data = {
			// to skip choosing the students
			// as the student's pass is to be reported
			report: this.profile,
			isHallPass,
			...passData,
		};

		const reportRef = this.dialog.open(ReportFormComponent, {
			panelClass: ['form-dialog-container', this.isIOSTablet ? 'ios-report-dialog' : 'report-dialog'],
			backdropClass: 'cdk-overlay-transparent-backdrop',
			data,
		});

		reportRef.afterOpened().subscribe(() => {
			// back button will close the dialog
			// it usually close the dialog or it goes back one step the report form
			// report form was/is a 2-step form
			const c = reportRef.componentInstance;
			c.forceCloseClick = true;
			c.useChipInsteadSearch = true;
		});

		reportRef.afterClosed().subscribe();
	}

	openCreatePass(event) {
		event.stopPropagation();
		const settings = [
			{
				label: 'Create pass for now',
				icon: './assets/Plus (Blue-Gray).svg',
				textColor: '#7f879d',
				backgroundColor: '#F4F4F4',
				action: 'now',
			},
			{
				label: 'Create future pass',
				icon: './assets/Schedule pass (Blue-Gray).svg',
				textColor: '#7f879d',
				backgroundColor: '#F4F4F4',
				action: 'feature',
			},
		];
		UNANIMATED_CONTAINER.next(true);
		const st = this.dialog.open(SettingsDescriptionPopupComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: { trigger: event.currentTarget, settings },
		});

		st.afterClosed()
			.pipe(
				tap(() => UNANIMATED_CONTAINER.next(false)),
				filter((r) => !!r)
			)
			.subscribe((action) => {
				const mainFormRef = this.dialog.open(CreateHallpassFormsComponent, {
					panelClass: 'main-form-dialog-container',
					backdropClass: 'custom-backdrop',
					maxWidth: '100vw',
					data: {
						forLater: action === 'feature',
						forStaff: true,
						forInput: true,
						fromAdmin: true,
						adminSelectedStudent: this.profile,
					},
				});
			});
	}

	notClose(value) {
		if (value) {
			setTimeout(() => {
				this.destroyClose.emit(value);
			}, 200);
		} else {
			this.destroyClose.emit(value);
		}
	}

	openPass({ pass }) {
		if (!this.isResize) {
			this.close.emit();
		}
		this.domCheckerService.scalePassCardTrigger$.next('open');
		const expiredPass = this.dialog.open(PassCardComponent, {
			panelClass: 'teacher-pass-card-dialog-container',
			backdropClass: this.isResize ? 'invis-backdrop' : 'custom-backdrop',
			data: { pass, forStaff: true, showStudentInfoBlock: !this.isResize, passForStudentsComponent: this.isResize, hasDeleteButton: true },
		});

		expiredPass.afterClosed().subscribe(() => {
			this.domCheckerService.scalePassCardTrigger$.next('close');
		});
	}
}
