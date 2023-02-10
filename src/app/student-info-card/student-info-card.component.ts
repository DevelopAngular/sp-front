import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostListener,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { User } from '../models/User';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HallPassesService } from '../services/hall-passes.service';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { QuickPreviewPasses } from '../models/QuickPreviewPasses';
import { UserService } from '../services/user.service';
import { School } from '../models/School';
import { HallPass } from '../models/HallPass';
import { concatMap, distinctUntilChanged, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { UNANIMATED_CONTAINER } from '../consent-menu-overlay';
import { SettingsDescriptionPopupComponent } from '../settings-description-popup/settings-description-popup.component';
import { UserStats } from '../models/UserStats';
import { DateTimeFilterComponent } from '../admin/explore/date-time-filter/date-time-filter.component';
import * as moment from 'moment';
import { CreateHallpassFormsComponent } from '../create-hallpass-forms/create-hallpass-forms.component';
import { ReportFormComponent } from '../report-form/report-form.component';
import { ModelFilterComponent } from './model-filter/model-filter.component';
import { ToastService } from '../services/toast.service';
import { MyProfileDialogComponent } from '../my-profile-dialog/my-profile-dialog.component';
import { NotificationFormComponent } from '../notification-form/notification-form.component';
import { StatusPopupComponent } from '../admin/profile-card-dialog/status-popup/status-popup.component';
import { EncounterPreventionDialogComponent } from '../admin/accounts/encounter-prevention-dialog/encounter-prevention-dialog.component';
import { EncounterPreventionService } from '../services/encounter-prevention.service';
import { ExclusionGroup } from '../models/ExclusionGroup';
import { EditAvatarComponent } from '../admin/profile-card-dialog/edit-avatar/edit-avatar.component';
import { ResizeProfileImage } from '../animations';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { Util } from '../../Util';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportInfoDialogComponent } from '../admin/explore/report-info-dialog/report-info-dialog.component';
import { HttpService } from '../services/http-service';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { ProfilePictureComponent } from '../admin/accounts/profile-picture/profile-picture.component';
import { DarkThemeSwitch } from '../dark-theme-switch';
import { PassLimitService } from '../services/pass-limit.service';
import { StudentPassLimit } from '../models/HallPassLimits';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { IntroData } from '../ngrx/intros';
import { IdcardOverlayContainerComponent } from '../idcard-overlay-container/idcard-overlay-container.component';
import { QRBarcodeGeneratorService } from '../services/qrbarcode-generator.service';
import { IDCard, IDCardService } from '../services/IDCardService';
import { IdCardGradeLevelsComponent } from '../admin/id-cards/id-card-grade-levels/id-card-grade-levels.component';
import { IdCardIdNumbersComponent } from '../admin/id-cards/id-card-id-numbers/id-card-id-numbers.component';
import { PassLimitStudentInfoComponent } from '../pass-limit-student-info/pass-limit-student-info.component';
import { RecommendedDialogConfig } from '../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import { LiveDataService } from '../live-data/live-data.service';

declare const window: Window;

@Component({
	selector: 'app-student-info-card',
	templateUrl: './student-info-card.component.html',
	styleUrls: ['./student-info-card.component.scss'],
	animations: [ResizeProfileImage],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentInfoCardComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('left') left: ElementRef;
	@ViewChild('right') right: ElementRef;
	@ViewChild('dateButton') dateButton: ElementRef;
	@ViewChild('avatar') avatar: ElementRef;
	@ViewChild('editIcon') editIcon: ElementRef;

	profile: User;

	loadingPassesStats$: Observable<boolean>;
	studentsStatsLoading$: Observable<boolean>;

	futurePasses: HallPass[] = [];
	futurePassesLoading = this.liveDataService.futurePassesLoading$;
	passesStats$: Observable<QuickPreviewPasses>;
	studentStats$: Observable<UserStats>;
	lastStudentPasses$: Observable<HallPass[]>;

	exclusionGroups$: Observable<ExclusionGroup[]>;
	exclusionGroupsLoading$: Observable<boolean>;
	user: User;

	school: School;
	studentPassLimitSubs: Subscription;
	studentPassLimit: StudentPassLimit;

	adminCalendarOptions = {
		rangeId: 'range_6',
		toggleResult: 'Range',
	};
	selectedDate: { start: moment.Moment; end: moment.Moment } = {
		start: moment('1/8/2022', 'DD/MM/YYYY'),
		end: moment().endOf('day'),
	};

	isFullScreenFuturePasses = false;
	isFullScreenExpiredPasses = false;
	isFullScreenReports: boolean;

	isScrollable: boolean;
	isRightScroll: boolean;
	animationTrigger = { value: 'open', params: { size: '88' } };
	profileEmail: string;

	isOpenAvatarDialog: boolean;
	loadingProfilePicture: Subject<boolean> = new Subject<boolean>();
	schoolsLength$: Observable<number>;
	destroy$: Subject<any> = new Subject<any>();
	introsData: IntroData;
	introSubs: Subscription;
	passLimitNuxWrapperPosition: ConnectedPosition = {
		originX: 'center',
		originY: 'bottom',
		overlayX: 'start',
		overlayY: 'center',
		offsetY: 30,
		offsetX: 50,
	};
	showPassLimitNux = new Subject<boolean>();
	passLimitStudentInfoRef: MatDialogRef<PassLimitStudentInfoComponent>;
	IDCardEnabled = false;
	IDCARDDETAILS: any;

	constructor(
		private dialog: MatDialog,
		private passesService: HallPassesService,
		private userService: UserService,
		private cdr: ChangeDetectorRef,
		private toast: ToastService,
		private encounterPreventionService: EncounterPreventionService,
		private route: ActivatedRoute,
		private router: Router,
		private http: HttpService,
		private darkTheme: DarkThemeSwitch,
		private passLimitsService: PassLimitService,
		private qrBarcodeGenerator: QRBarcodeGeneratorService,
		private idCardService: IDCardService,
		private liveDataService: LiveDataService
	) {}

	@HostListener('document.scroll', ['$event'])
	scroll(event) {
		if (event.currentTarget.scrollTop > 20) {
			this.isScrollable = true;
			// this.animationTrigger = {value: 'close', params: {size: '32'}};
		} else {
			this.isScrollable = false;
			// this.animationTrigger = {value: 'open', params: {size: '88'}};
		}
	}

	@HostListener('document.scroll', ['$event'])
	rightScroll(event) {
		this.isRightScroll = event.currentTarget.scrollTop > 10;
	}

	get accountType() {
		if (this.profile.demo_account) {
			return 'Demo';
		}

		const sync_type = this.profile.sync_types[0];
		if (sync_type === 'google') {
			return 'G Suite';
		}
		if (sync_type === 'gg4l') {
			return 'GG4L';
		}
		if (sync_type === 'clever') {
			return 'Clever';
		}
		return 'Standard';
	}

	get isLongName() {
		return this.profile.display_name.length > 20;
	}

	ngOnInit(): void {
		this.school = this.userService.getUserSchool();
		this.schoolsLength$ = this.http.schoolsLength$;
		this.userService.user$
			.pipe(
				takeUntil(this.destroy$),
				filter((r) => !!r),
				map((u) => User.fromJSON(u))
			)
			.subscribe((user) => {
				// THIS IS THE LOGGED-IN TEACHER
				this.user = user;
			});

		this.route.params
			.pipe(
				filter((params) => 'id' in params),
				switchMap((params) => this.userService.searchProfileById(params['id'])),
				takeUntil(this.destroy$)
			)
			.subscribe({
				next: (user) => {
					// THIS IS THE PROFILE OF THE STUDENT WHOSE PAGE WE'RE CURRENTLY ON
					this.profile = user;
					this.school = this.userService.getUserSchool();
					this.passesService.getQuickPreviewPassesRequest(this.profile.id, true);
					this.getUserStats();

					this.liveDataService
						.watchFutureHallPasses()
						.pipe(
							map((passes) => passes.filter((p) => p.student.id == this.profile.id)),
							takeUntil(this.destroy$),
							distinctUntilChanged((passes1, passes2) => JSON.stringify(passes1) === JSON.stringify(passes2))
						)
						.subscribe({
							next: (futurePasses) => (this.futurePasses = futurePasses),
						});

					this.studentStats$ = this.userService.studentsStats$.pipe(
						map<Record<string, UserStats>, UserStats>((allStats) => allStats[this.profile.id]),
						filter(Boolean),
						map<UserStats, UserStats>((profileStats) => ({
							...profileStats,
							expired_passes: profileStats?.expired_passes.filter((p) => p.end_time.getTime() < Date.now()),
						}))
					);
					this.encounterPreventionService.getExclusionGroupsRequest({ student: this.profile.id });

					if (this.studentPassLimitSubs) {
						this.studentPassLimitSubs.unsubscribe();
					}

					this.studentPassLimitSubs = merge(
						this.passLimitsService.watchPassLimits(),
						this.passLimitsService.watchIndividualPassLimit(this.profile.id)
					)
						.pipe(concatMap(() => this.passLimitsService.getStudentPassLimit(this.profile.id)))
						.subscribe((res) => {
							this.studentPassLimit = res;
							this.cdr.detectChanges();
						});
				},
			});

		this.exclusionGroups$ = this.encounterPreventionService.exclusionGroups$;
		this.exclusionGroupsLoading$ = this.encounterPreventionService.exclusionGroupsLoading$;
		this.lastStudentPasses$ = this.passesService.quickPreviewPasses$.pipe(map((passes) => passes.map((pass) => HallPass.fromJSON(pass))));
		this.loadingPassesStats$ = this.passesService.quickPreviewPassesLoading$;
		this.passesStats$ = this.passesService.quickPreviewPassesStats$;
		this.studentsStatsLoading$ = this.userService.studentsStatsLoading$;

		this.passesService.createPassEvent$.pipe(take(1)).subscribe((res) => {
			this.router.navigate(['/main/passes']);
		});

		this.userService.currentUpdatedAccount$._profile_student.pipe(filter((r) => !!r)).subscribe((user) => {
			this.profile = user;
			this.cdr.detectChanges();
			this.userService.clearCurrentUpdatedAccounts();
		});

		if (!this.userService.getFeatureFlagDigitalID()) {
			this.IDCardEnabled = true;
		} else {
			this.idCardService.getIDCardDetails().subscribe({
				next: (result: any) => {
					if (result?.results?.digital_id_card) {
						this.IDCARDDETAILS = result.results.digital_id_card;
						if (this.IDCARDDETAILS.enabled && this.IDCARDDETAILS.visible_to_who != 'Staff only') {
							this.IDCardEnabled = true;
						}
					}
				},
			});
		}
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.introSubs = this.userService.introsData$.pipe(filter((i) => !!i)).subscribe({
				next: (intros) => {
					this.introsData = intros;
					this.showPassLimitNux.next(!intros?.student_pass_limit?.universal?.seen_version);
				},
			});
		}, 3000);
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
		if (this.introSubs) {
			this.introSubs.unsubscribe();
		}
	}

	getDate(date) {
		return moment(date).format('MMM YYYY') + ' at ' + moment(date).format('hh:mm A');
	}

	getLastActiveDate(date) {
		return Util.formatDateTime(new Date(date));
	}

	getEmailOrUsername() {
		if (this.profile.primary_email.includes('@spnx.local')) {
			this.profileEmail = this.profile.primary_email.replace('@spnx.local', '');
			return 'Username';
		} else {
			this.profileEmail = this.profile.primary_email;
			return 'Email';
		}
	}

	secondToTime(seconds) {
		if (!seconds) {
			return '0 min';
		}
		let time = '';
		const days = moment.duration(seconds * 1000).days();
		let hours = moment.duration(seconds * 1000).hours();
		const minutes = moment.duration(seconds * 1000).minutes();
		if (days > 0) {
			hours = hours + days * 24;
		}
		if (hours > 0) {
			time += hours + 'hr ';
		}
		time += (minutes < 1 && moment.duration(seconds * 1000).seconds() > 1 ? 1 : minutes) + ' min';
		return time;
	}

	getUserStats() {
		this.userService.getUserStatsRequest(this.profile.id, {
			created_after: this.selectedDate.start.toISOString(),
			end_time_before: this.selectedDate.end.toISOString(),
		});
	}

	back() {
		window.history.back();
	}

	openStudentSettings(elem) {
		const settings: any = [
			{
				label: 'Copy private link',
				icon: './assets/Private Link (Blue-Gray).svg',
				textColor: '#7f879d',
				backgroundColor: '#F4F4F4',
				action: 'link',
				tooltip: 'Copy a private link to this student and send it to another staff member at your school.',
			},
		];
		if (this.IDCardEnabled) {
			settings.push({
				label: 'Open ID Card',
				icon: './assets/Digital ID Card (Gray).svg',
				textColor: '#7f879d',
				backgroundColor: '#F4F4F4',
				action: 'idcard',
				isPro: !this.userService.getFeatureFlagDigitalID(),
				// tooltip: 'Copy a private link to this student and send it to another staff member at your school.'
			});
		}
		if (this.user.isAdmin()) {
			settings.push(
				{
					label: 'Edit status',
					icon: './assets/Account Mark (Blue-Gray).svg',
					textColor: '#7f879d',
					backgroundColor: '#F4F4F4',
					action: 'status',
					disableClose: true,
				},
				{
					label: 'Change password',
					icon: './assets/Change Password (Blue-Gray).svg',
					textColor: '#7f879d',
					backgroundColor: '#F4F4F4',
					action: 'password',
				}
				// {
				//   label: 'Delete account',
				//   icon: './assets/Delete (Red).svg',
				//   textColor: '#E32C66',
				//   backgroundColor: '#F4F4F4',
				//   confirmButton: true,
				//   description: 'Are you sure you want to delete account?',
				//   action: 'delete',
				//   withoutHoverDescription: true
				// }
			);
		}
		UNANIMATED_CONTAINER.next(true);
		const st = this.dialog.open(SettingsDescriptionPopupComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: { trigger: elem.currentTarget, settings, profile: this.profile },
		});

		st.afterClosed()
			.pipe(tap(() => UNANIMATED_CONTAINER.next(false)))
			.subscribe(async (action) => {
				if (action === 'link') {
					navigator.clipboard.writeText(`${window.location.href}?student_id=${this.profile.id}`).then(() => {
						this.toast.openToast({
							title: 'Link copied to clipboard!',
							subtitle: "Share this student's info with other staff members by sending them the link.",
							type: 'info',
						});
					});
				} else if (action === 'password') {
					this.dialog.open(MyProfileDialogComponent, {
						panelClass: 'sp-form-dialog',
						width: '425px',
						height: '500px',
						data: { target: 'password', profile: this.profile },
					});
				} else if (action === 'delete') {
					this.userService.deleteUserRequest(this.profile, '_profile_student');
				} else if (action === 'idcard') {
					if (!this.userService.getFeatureFlagDigitalID()) {
						window.open('https://www.smartpass.app/idcards', '_blank');
						// const dialogRef = this.dialog.open(IdcardOverlayContainerComponent, {
						//   panelClass: "id-card-overlay-container",
						//   backdropClass: "custom-bd",
						//   data: {isPro: true}
						// });
					} else {
						const idCardData: IDCard = {
							backgroundColor: this.IDCARDDETAILS.color,
							greadLevel: this.IDCARDDETAILS.show_grade_levels ? this.profile.grade_level : null,
							idNumberData: this.profile?.custom_id
								? {
										idNumber: this.profile?.custom_id,
										barcodeURL: await this.qrBarcodeGenerator.selectBarcodeType(this.IDCARDDETAILS.barcode_type, this.profile?.custom_id),
								  }
								: { idNumber: '', barcodeURL: '' },
							barcodeType: this.IDCARDDETAILS.barcode_type,
							backsideText: this.IDCARDDETAILS.backside_text,
							logoURL: this.IDCARDDETAILS.signed_url,
							profilePicture: this.profile.profile_picture,
							schoolName: 'Demo School',
							userName: this.profile.display_name,
							userRole: 'Student',
							showCustomID: this.IDCARDDETAILS.show_custom_ids,
							// userRole: this.profile.isStudent() ?  'Student' : 'Staff'
						};

						this.dialog.open(IdcardOverlayContainerComponent, {
							panelClass: 'id-card-overlay-container',
							backdropClass: 'custom-bd',
							data: { idCardData: idCardData, isLoggedIn: false },
						});
					}
				}
			});
	}

	openCreatePassPopup(elem) {
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
			data: { trigger: elem.currentTarget, settings },
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

	openDateFilter(event) {
		UNANIMATED_CONTAINER.next(true);
		const calendar = this.dialog.open(DateTimeFilterComponent, {
			id: 'calendar_filter',
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: {
				target: new ElementRef(event.currentTarget),
				date: this.selectedDate,
				options: this.adminCalendarOptions,
			},
		});

		calendar
			.afterClosed()
			.pipe(
				tap(() => UNANIMATED_CONTAINER.next(false)),
				filter((res) => res)
			)
			.subscribe(({ date, options }) => {
				this.adminCalendarOptions = options;
				if (!date.start) {
					this.selectedDate = { start: moment(date).add(6, 'minutes'), end: moment(date).add(6, 'minutes') };
				} else {
					this.selectedDate = { start: date.start.startOf('day'), end: date.end.endOf('day') };
				}
				this.getUserStats();
				this.cdr.detectChanges();
			});
	}

	openReportForm(useChipInsteadSearch: boolean = false) {
		const RF = this.dialog.open(ReportFormComponent, {
			panelClass: ['form-dialog-container', 'report-dialog'],
			backdropClass: 'custom-backdrop',
			width: '425px',
			height: '500px',
			data: {
				report: this.profile,
				useChipInsteadSearch,
			},
		});
	}

	openFilter({ event, action }) {
		const settings = [{ title: 'Compare with another student', icon: './assets/Compare Students (Blue-Gray).svg', action: 'compare' }];
		if (action === 'Passes') {
			settings.unshift({ title: 'Filter passes', icon: './assets/Filter (Blue-Gray).svg', action: 'filter' });
			settings.push({ title: 'Explore all passes', icon: './assets/Passes (Blue-Gray).svg', action: 'explore' });
			const PF = this.dialog.open(ModelFilterComponent, {
				panelClass: 'consent-dialog-container',
				backdropClass: 'invis-backdrop',
				data: { trigger: event.currentTarget, settings },
			});

			PF.afterClosed()
				.pipe(filter((r) => !!r))
				.subscribe((value) => {
					if (value === 'filter') {
						this.openDateFilter(this.dateButton.nativeElement);
					}
				});
		} else if (action === 'Reports') {
			settings.unshift({ title: 'Filter reports', icon: './assets/Filter (Blue-Gray).svg', action: 'filter' });
			settings.push({ title: 'Explore all reports', icon: './assets/Passes (Blue-Gray).svg', action: 'explore' });
			const PF = this.dialog.open(ModelFilterComponent, {
				panelClass: 'consent-dialog-container',
				backdropClass: 'invis-backdrop',
				data: { trigger: event.currentTarget, settings },
			});
		} else if (action === 'Overview') {
			const PF = this.dialog.open(ModelFilterComponent, {
				panelClass: 'consent-dialog-container',
				backdropClass: 'invis-backdrop',
				data: { trigger: event.currentTarget },
			});
		}
	}

	openNotification() {
		this.dialog.open(NotificationFormComponent, {
			panelClass: 'form-dialog-container',
			backdropClass: 'custom-backdrop',
			width: '462px',
			height: '600px',
			data: { profile: this.profile },
		});
	}

	openStatusPopup(elem) {
		const SPC = this.dialog.open(StatusPopupComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: {
				trigger: elem.currentTarget,
				profile: this.profile,
				profileStatus: this.profile.status,
				withoutDelete: true,
			},
		});

		SPC.afterClosed()
			.pipe(filter((res) => !!res))
			.subscribe((status) => {
				this.userService.updateUserRequest(this.profile, { status });
				this.toast.openToast({ title: 'Account status updated', type: 'success' });
			});
	}

	openEncounterPrevention(page, currentGroup?) {
		const encounterDialog = this.dialog.open(EncounterPreventionDialogComponent, {
			panelClass: 'overlay-dialog',
			backdropClass: 'custom-bd',
			width: '425px',
			height: '500px',
			data: { forceNextPage: page, currentUser: this.profile, forceGroup: currentGroup },
		});
	}

	openPassLimitsDialog() {
		this.passLimitStudentInfoRef = this.dialog.open(PassLimitStudentInfoComponent, {
			...RecommendedDialogConfig,
			height: '500px',
			width: '425px',
			data: {
				studentPassLimit: this.studentPassLimit,
				user: this.user,
			},
		});
	}

	editWindow(event) {
		this.isOpenAvatarDialog = true;
		if (!this.userService.getUserSchool().profile_pictures_completed) {
			this.consentDialogOpen(this.editIcon.nativeElement);
		} else {
			this.openEditAvatar(this.editIcon.nativeElement);
		}
	}

	consentDialogOpen(evt) {
		const options = [];
		options.push(
			this.genOption(
				'Add individual picture',
				this.darkTheme.getColor({
					dark: '#FFFFFF',
					white: '#7f879d',
				}),
				'individual',
				this.darkTheme.getIcon({ iconName: 'Plus', darkFill: 'White', lightFill: 'Blue-Gray' })
			)
		);
		options.push(
			this.genOption(
				'Bulk upload pictures',
				this.darkTheme.getColor({
					dark: '#FFFFFF',
					white: '#7f879d',
				}),
				'bulk',
				this.darkTheme.getIcon({ iconName: 'Add Avatar', darkFill: 'White', lightFill: 'Blue-Gray' })
			)
		);

		UNANIMATED_CONTAINER.next(true);

		const cancelDialog = this.dialog.open(ConsentMenuComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: { options: options, trigger: new ElementRef(evt) },
		});

		cancelDialog
			.afterClosed()
			.pipe(
				tap(() => {
					UNANIMATED_CONTAINER.next(false);
					this.isOpenAvatarDialog = false;
				}),
				filter((r) => !!r)
			)
			.subscribe((action) => {
				if (action === 'individual') {
					this.isOpenAvatarDialog = true;
					this.openEditAvatar(this.editIcon.nativeElement);
				} else if (action === 'bulk') {
					const PPD = this.dialog.open(ProfilePictureComponent, {
						id: 'student-info',
						panelClass: 'accounts-profiles-dialog',
						backdropClass: 'custom-bd',
						width: '425px',
						height: '500px',
					});
				}
			});
	}

	genOption(display, color, action, icon?) {
		return { display, color, action, icon };
	}

	openEditAvatar(event) {
		const target = event.currentTarget ? event.currentTarget : event;
		const ED = this.dialog.open(EditAvatarComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: { trigger: target, user: this.profile },
		});

		ED.afterClosed()
			.pipe(
				tap(() => (this.isOpenAvatarDialog = false)),
				filter((r) => !!r),
				tap(({ action, file }) => {
					this.loadingProfilePicture.next(true);
					if (action === 'add') {
						this.userService.addProfilePictureRequest(this.profile, '_profile_student', file);
					} else if (action === 'edit') {
						this.userService.addProfilePictureRequest(this.profile, '_profile_student', file);
					}
				}),
				switchMap(() => {
					return this.userService.currentUpdatedAccount$['_profile_student'].pipe(filter((res) => !!res));
				}),
				tap((user) => {
					this.profile = user;
					this.userService.clearCurrentUpdatedAccounts();
					this.loadingProfilePicture.next(false);
				})
			)
			.subscribe();
	}

	deleteAvatar() {
		this.loadingProfilePicture.next(true);
		this.userService
			.deleteProfilePicture(this.profile, '_profile_student')
			.pipe(
				filter((res) => !!res),
				take(1)
			)
			.subscribe((res) => {
				this.profile = { ...this.profile, profile_picture: null } as User;
				this.userService.clearCurrentUpdatedAccounts();
				this.loadingProfilePicture.next(false);
			});
	}

	openPassCard({ time$, pass }) {
		pass.start_time = new Date(pass.start_time);
		pass.end_time = new Date(pass.end_time);
		const now = Date.now();

		const data = {
			pass: pass,
			fromPast: pass.end_time.getTime() < now,
			forFuture: now < pass.start_time.getTime(),
			forMonitor: false,
			isActive: false,
			forStaff: true,
		};
		const dialogRef = this.dialog.open(PassCardComponent, {
			panelClass: 'search-pass-card-dialog-container',
			backdropClass: 'custom-bd',
			data: data,
		});
	}

	openReportInfo(report) {
		this.dialog.open(ReportInfoDialogComponent, {
			panelClass: 'overlay-dialog',
			backdropClass: 'custom-bd',
			data: { report: report },
		});
	}

	dateText({ start, end }): string {
		if (start.isSame(moment().subtract(3, 'days'), 'day')) {
			return 'Last 3 days';
		}
		if (start.isSame(moment().subtract(7, 'days'), 'day')) {
			return 'Last 7 days';
		}
		if (start.isSame(moment().subtract(30, 'days'), 'day')) {
			return 'Last 30 days';
		}
		if (start.isSame(moment().subtract(90, 'days'), 'day')) {
			return 'Last 90 days';
		}
		if (start.isSame(moment('1/8/' + moment().subtract(1, 'year').year(), 'DD/MM/YYYY'))) {
			return 'This school year';
		}
		if (start && end) {
			return start.isSame(end, 'day') ? start.format('MMM D') : start.format('MMM D') + ' to ' + end.format('MMM D');
		}
	}

	openGradeLevel() {
		const PPD = this.dialog.open(IdCardGradeLevelsComponent, {
			panelClass: 'accounts-profiles-dialog',
			backdropClass: 'custom-bd',
			width: '425px',
			height: '510px',
		});
	}

	openIDNumber() {
		const PPD = this.dialog.open(IdCardIdNumbersComponent, {
			panelClass: 'accounts-profiles-dialog',
			backdropClass: 'custom-bd',
			width: '425px',
			height: '510px',
		});
	}

	dismissPassLimitNux() {
		this.showPassLimitNux.next(false);
		this.userService.updateIntrosStudentPassLimitRequest(this.introsData, 'universal', '1');
	}

	// predicate tu use in filtering HallPass array
	isNotCancelledPass(p: HallPass): boolean {
		return !(p.cancellable_by_student === false && p.cancelled !== null);
	}
}
