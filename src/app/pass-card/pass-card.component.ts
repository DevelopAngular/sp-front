import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { User } from '../models/User';
import { HallPass } from '../models/HallPass';
import { Util } from '../../Util';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { Navigation } from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import { catchError, concatMap, filter, map, pluck, retryWhen, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, interval, merge, Observable, of, Subject, throwError, zip } from 'rxjs';
import { CreateFormService } from '../create-hallpass-forms/create-form.service';
import { HallPassesService } from '../services/hall-passes.service';
import { TimeService } from '../services/time.service';
import { ScreenService } from '../services/screen.service';
import { UNANIMATED_CONTAINER } from '../consent-menu-overlay';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { School } from '../models/School';
import { DeviceDetection } from '../device-detection.helper';
import { scalePassCards } from '../animations';
import { DomCheckerService } from '../services/dom-checker.service';
import { UserService } from '../services/user.service';
import { ToastService } from '../services/toast.service';
import { EncounterPreventionService } from '../services/encounter-prevention.service';
import { remove } from 'lodash';
import { HttpErrorResponse } from '@angular/common/http';
import {
	ConfirmationDialogComponent,
	ConfirmationTemplates,
	RecommendedDialogConfig,
} from '../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import { LocationsService } from '../services/locations.service';
import { Location } from '../models/Location';
import { RecurringSchedulePassService } from '../services/recurring-schedule-pass.service';
import { RecurringConfig } from '../models/RecurringFutureConfig';
import { PassLimit } from '../models/PassLimit';

@Component({
	selector: 'app-pass-card',
	templateUrl: './pass-card.component.html',
	styleUrls: ['./pass-card.component.scss'],
	animations: [scalePassCards],
})
export class PassCardComponent implements OnInit, OnDestroy {
	@Input() pass: HallPass;
	@Input() forInput = false;
	@Input() fromPast = false;
	@Input() forFuture = false;
	@Input() isActive = false;
	@Input() forStaff = false;
	@Input() forMonitor = false;
	@Input() forKioskMode = false;
	@Input() formState: Navigation;
	@Input() students: User[] = [];

	@Output() cardEvent: EventEmitter<any> = new EventEmitter();

	@ViewChild('cardWrapper') cardWrapper: ElementRef;
	@ViewChild('confirmDialogBody') confirmDialog: TemplateRef<HTMLElement>;
	@ViewChild('confirmDialogBodyVisibility') confirmDialogVisibility: TemplateRef<HTMLElement>;

	timeLeft = '';
	valid = true;
	returnData: any = {};
	overlayWidth = '0px';
	buttonWidth = 288;

	selectedDuration: number;
	selectedTravelType: string;
	cancelOpen = false;
	selectedStudents: User[] = [];
	fromHistory;
	fromHistoryIndex;

	pagerPages = 0;

	timers: number[] = [];

	p1Title;
	p1Subtitle;
	p1Stamp;
	p2Title;
	p2Subtitle;
	p2Stamp;
	p3Title;
	p3Subtitle;
	p3Stamp;
	p3StampExtra;
	p4Title;
	p4Subtitle;
	p4StampExtra;
	p4Stamp;

	user: User;
	activePage;

	performingAction: boolean;
	isModal: boolean;
	showStudentInfoBlock: boolean = true;
	passForStudentsComponent: boolean;
	hideButton: boolean;

	startEndPassLoading$: Observable<boolean>;

	isSeen: boolean;

	activePassTime$: Observable<string>;

	header: string;
	options: any = [];
	cancelEditClick: boolean;
	frameMotion$: BehaviorSubject<any>;
	currentSchool: School;
	recurringConfig: RecurringConfig;
	passLimit: PassLimit;

	isEnableProfilePictures$: Observable<boolean>;

	scaleCardTrigger$: Observable<string>;

	destroy$: Subject<any> = new Subject<any>();

	constructor(
		public dialogRef: MatDialogRef<PassCardComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private hallPassService: HallPassesService,
		public dialog: MatDialog,
		private formService: CreateFormService,
		private timeService: TimeService,
		public screenService: ScreenService,
		private shortcutsService: KeyboardShortcutsService,
		private domCheckerService: DomCheckerService,
		private userService: UserService,
		private toastService: ToastService,
		private encounterService: EncounterPreventionService,
		private locationsService: LocationsService,
		private recurringConfigService: RecurringSchedulePassService
	) {}

	getUserName(user: any) {
		if (user instanceof User) {
			return user.isSameObject(this.user) ? 'Me' : user.first_name.substr(0, 1) + '. ' + user.last_name;
		} else {
			return user.first_name.substr(0, 1) + '. ' + user.last_name;
		}
	}

	get gradient() {
		return 'radial-gradient(circle at 73% 71%, ' + this.pass.color_profile.gradient_color + ')';
	}

	get studentText() {
		if (this.formState && this.formState.data.selectedGroup) {
			return this.formState.data.selectedGroup.title;
		} else {
			const selectedStudents = this.formState.data.roomStudents ?? this.selectedStudents;
			return selectedStudents
				? selectedStudents?.length > 2
					? selectedStudents[0]?.display_name + ' and ' + (selectedStudents?.length - 1) + ' more'
					: selectedStudents[0]?.display_name + (selectedStudents?.length > 1 ? ' and ' + selectedStudents[1]?.display_name : '')
				: this.pass?.student?.display_name + ` (${this.studentEmail})`;
		}
	}

	get studentEmail() {
		return this.pass.student.primary_email.split('@', 1)[0];
	}

	get isMobile() {
		return DeviceDetection.isMobile();
	}

	get closeIcon() {
		if ((this.isActive && this.forStaff) || this.forMonitor) {
			return './assets/Dots (Transparent).svg';
		} else {
			return './assets/' + (this.forInput ? 'Chevron Left ' : 'Delete ') + '(Transparent).svg';
		}
	}

	get hasClose() {
		if (this.hideButton === false || this.fromPast) {
			return false;
		}

		// return ((this.forInput || this.forStaff || this.pass.cancellable_by_student || this.user.isStudent()) && !this.fromPast) && !this.hideButton;
		return this.user?.id === this.pass?.issuer?.id
			? true
			: (this.forInput || this.forStaff || (this.pass.cancellable_by_student && this.user.isStudent())) && !this.fromPast && !this.hideButton;
	}

	get buttonText(): string {
		const numStudents = this.selectedStudents.length;
		if (this.forFuture && this.forInput) {
			return 'Schedule Pass' + (numStudents > 1 ? 'es' : '');
		}

		if (this.forStaff) {
			return this.formState?.data?.destLimitReached && numStudents === 1 ? 'Send to Line' : 'Send Pass' + (numStudents > 1 ? 'es' : '');
		}

		return this.formState?.data?.destLimitReached ? 'Wait in Line' : 'Start Pass' + (numStudents > 1 ? 'es' : '');
	}

	ngOnInit() {
		this.frameMotion$ = this.formService.getFrameMotionDirection();
		this.scaleCardTrigger$ = this.domCheckerService.scalePassCard;
		this.currentSchool = this.userService.getUserSchool();
		this.isEnableProfilePictures$ = this.userService.isEnableProfilePictures$;
		this.startEndPassLoading$ = this.hallPassService.startPassLoading$;

		if (this.data['pass']) {
			this.isModal = true;
			this.pass = this.data['pass'];
			this.forInput = this.data['forInput'];
			this.isActive = this.data['isActive'];
			this.forFuture = this.data['forFuture'];
			this.fromPast = this.data['fromPast'];
			this.forStaff = this.data['forStaff'];
			this.forKioskMode = this.data['kioskMode'];
			this.selectedStudents = this.data['selectedStudents'];
			this.forMonitor = this.data['forMonitor'];
			this.fromHistory = this.data['fromHistory'];
			this.fromHistoryIndex = this.data['fromHistoryIndex'];
			this.activePassTime$ = this.data['activePassTime$'];
			this.showStudentInfoBlock = this.data['showStudentInfoBlock'];
			this.passForStudentsComponent = this.data['passForStudentsComponent'];
			this.hideButton = this.data['hasDeleteButton'];
		} else {
			this.selectedStudents = this.students;
		}

		merge(this.hallPassService.watchEndPass(), this.hallPassService.watchCancelPass())
			.pipe(
				takeUntil(this.destroy$),
				map(({ action, data }) => HallPass.fromJSON(data))
			)
			.subscribe((hallPass) => {
				if (hallPass.id == this.pass.id) {
					this.dialogRef.close();
				}
			});

		if (this.pass?.schedule_config_id) {
			this.recurringConfigService.getRecurringScheduledConfig(this.pass.schedule_config_id).subscribe({
				next: (c) => (this.recurringConfig = c),
			});
		}

		this.userService.user$
			.pipe(
				map((user) => User.fromJSON(user)),
				takeUntil(this.destroy$)
			)
			.subscribe((user) => {
				this.user = user;
				this.buildPages();
			});

		if (!!this.pass && this.isActive) {
			merge(of(0), interval(1000))
				.pipe(
					tap((x) => {
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
					}),
					takeUntil(this.destroy$)
				)
				.subscribe();
		}
		this.shortcutsService.onPressKeyEvent$
			.pipe(
				filter(() => this.forStaff),
				pluck('key'),
				takeUntil(this.destroy$)
			)
			.subscribe((key) => {
				if (key[0] === 'e') {
					this.endPass();
				} else if (key[0] === 'r') {
					this.dialogRef.close({ report: this.pass.student });
				}
			});

		this.locationsService
			.listenLocationSocket()
			.pipe(
				takeUntil(this.destroy$),
				filter((res) => !!res),
				tap((res) => {
					try {
						const loc: Location = Location.fromJSON(res.data);
						this.locationsService.updateLocationSuccessState(loc);
						this.pass.destination.title = loc.title;
					} catch (e) {
						console.log(e);
					}
				})
			)
			.subscribe();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	updateDuration(dur: number) {
		this.returnData['duration'] = dur;
	}

	updateTravelType(travelType: string) {
		this.pass.travel_type = travelType;
	}

	formatDateTime(date: Date) {
		date = new Date(date);
		return Util.formatDateTime(date);
	}

	getDuration() {
		const start: Date = this.pass.start_time;
		const end: Date = this.pass.end_time;
		const timeDiff = Math.abs(start.getTime() - end.getTime());
		const diffSecs = Math.ceil(timeDiff / 1000);
		return Math.floor(diffSecs / 60) + ':' + (diffSecs % 60 < 10 ? '0' : '') + (diffSecs % 60);
	}

	buildPages() {
		if (this.pass.parent_invitation) {
			this.buildPage('Pass Request Sent', 'by ' + this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.flow_start), this.pagerPages + 1);
			this.buildPage(
				'Pass Request Accepted',
				'by ' + this.getUserName(this.pass.student),
				this.formatDateTime(this.pass.created),
				this.pagerPages + 1
			);
		} else if (this.pass.parent_request) {
			this.buildPage(
				'Pass Request Sent',
				'by ' + this.getUserName(this.pass.student),
				this.formatDateTime(this.pass.flow_start),
				this.pagerPages + 1
			);
			this.buildPage(
				'Pass Request Accepted',
				'by ' + this.getUserName(this.pass.issuer),
				this.formatDateTime(this.pass.created),
				this.pagerPages + 1
			);
		} else if (this.forFuture && this.pass.issuer) {
			this.buildPage('Pass Created', 'by ' + this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.created), this.pagerPages + 1);
			this.buildPage('Scheduled to start', '', this.formatDateTime(this.pass.start_time), this.pagerPages + 1);
		} else if (this.pass.issuer) {
			this.buildPage('Pass Created', 'by ' + this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.created), this.pagerPages + 1);
		}

		if (this.isActive) {
			this.buildPage('Pass Started', '', this.formatDateTime(this.pass.start_time), this.pagerPages + 1);
			this.activePage = this.pagerPages;
		} else if (this.fromPast) {
			this.buildPage('Pass Started', '', this.formatDateTime(this.pass.start_time), this.pagerPages + 1);
			const start: Date = this.pass.start_time;
			const end: Date = this.pass.end_time;
			const diff: number = (end.getTime() - start.getTime()) / 1000;
			const mins: number = Math.floor(Math.floor(diff) / 60);
			const secs: number = Math.abs(Math.floor(diff) % 60);
			const totalTime = mins + ':' + (secs < 10 ? '0' + secs : secs);
			this.buildPage('Pass Ended', '', totalTime, this.pagerPages + 1, ' - Total Time');
		}
	}

	buildPage(title: string, subtitle: string, stamp: string, page: number, stampExtra?: string) {
		if (page === 1) {
			this.p1Title = title;
			this.p1Subtitle = subtitle;
			this.p1Stamp = stamp;
		} else if (page === 2) {
			this.p2Title = title;
			this.p2Subtitle = subtitle;
			this.p2Stamp = stamp;
		} else if (page === 3) {
			this.p3Title = title;
			this.p3Subtitle = subtitle;
			this.p3Stamp = stamp;
			if (stampExtra) {
				this.p3StampExtra = stampExtra;
			}
		} else if (page === 4) {
			this.p4Title = title;
			this.p4Subtitle = subtitle;
			this.p4Stamp = stamp;
			if (stampExtra) {
				this.p4StampExtra = stampExtra;
			}
		}
		this.pagerPages++;
	}

	private prepareTemplateDataVisibility({ visibility_alerts, students }, origin, destination) {
		const out = [];
		for (let a of visibility_alerts) {
			const ss = a['room_students'].map((sid) => {
				const found = students.find((s) => s.User.id === sid);
				if (!found) return '<unknown name>';
				return found.User['first_name'] + ' ' + found.User['last_name'];
			});
			let joint = 'for';
			if (a['location_id'] == origin) {
				joint = 'to come from';
			} else if (a['location_id'] == destination) {
				joint = 'to go to';
			}
			//const phrase = `These students do not have permission ${joint} this room "${a['location_title']}"`;
			const phrase = `These students do not have permission ${joint} this room`;
			out.push({ phrase, students: ss.join(', ') });
		}
		return out;
	}

	get isRecurringFuture(): boolean {
		if (Number.isInteger(this.pass.schedule_config_id)) {
			// retrieving a pass from the server with a schedule_config_id
			return true;
		}

		return !!this.formState?.data?.date?.schedule_option;
	}

	newPass() {
		this.performingAction = true;
		const body = {
			duration: this.selectedDuration * 60,
			origin: this.pass.origin.id,
			destination: this.pass.destination.id,
			travel_type: this.selectedTravelType,
		};
		if (this.forStaff) {
			let ss: User[] = this.selectedStudents;
			if (this.formState.data?.roomStudents?.length > 0) {
				ss = this.formState.data.roomStudents;
			}
			body['students'] = ss.map((user) => user.id);
		} else {
			body['student'] = this.pass.student.id;
		}
		body['override_visibility'] = this.formState.data.roomOverride;

		if (this.forFuture) {
			body['issuer_message'] = this.pass.issuer_message;
			body['start_time'] = this.pass.start_time.toISOString();
			if (this.isRecurringFuture) {
				// if the schedule config is present and is repeating, then set the `recurring_scheduled_config` key, otherwise omit the key
				// from the body.
				// the backend will ignore if the key is not present
				body['recurring_scheduled_config'] = this.formState.data.date.schedule_option;
			}
		}
		if (this.forKioskMode) {
			body['self_issued'] = true;
		}
		if (!this.forStaff) {
			delete body['override_visibility'];
			if (this.forKioskMode) {
				// that's it, the origin room should be considered room visibility free
				// to permits a student in kiosk mode to appear in who-are-you component
				// so the code below
				body['override_visibility_origin'] = true;
			}
			body['isNotBulk'] = true;
		}

		of(body)
			.pipe(
				concatMap((b) => (this.forStaff ? this.hallPassService.bulkCreatePass(b) : this.hallPassService.createPass(b))),
				takeUntil(this.destroy$),
				switchMap(({ conflict_student_ids, passes }) => {
					if (conflict_student_ids) {
						if (!this.forStaff) {
							this.hallPassService.showEncounterPreventionToast({
								exclusionPass: {
									...this.pass,
									travel_type: this.selectedTravelType,
								} as HallPass,
								isStaff: this.forStaff,
							});
							this.dialogRef.close();
							return of(null);
						} else {
							return zip(
								...conflict_student_ids.map((id) => {
									return this.encounterService.getExclusionGroups({ student: id }).pipe(
										filter((groups) => groups.length > 0),
										take(1),
										tap((groups) => {
											const enabledGroups = groups.filter((g) => g.enabled);
											if (enabledGroups.length > 0) {
												this.hallPassService.showEncounterPreventionToast({
													exclusionPass: {
														...this.pass,
														travel_type: this.selectedTravelType,
														student: this.selectedStudents.find((user) => +user.id === +id),
													} as HallPass,
													isStaff: this.forStaff,
													exclusionGroups: enabledGroups,
												});
											}
										})
									);
								})
							);
						}
					}
					return of(null);
				}),
				retryWhen((errors: Observable<HttpErrorResponse>) => {
					const getOverrideFromDialog = (error) => {
						const afterDialogClosed$ = this.dialog
							.open(ConfirmationDialogComponent, {
								panelClass: 'overlay-dialog',
								backdropClass: 'custom-backdrop',
								closeOnNavigation: true,
								data: {
									headerText: '',
									body: this.confirmDialogVisibility,
									buttons: {
										confirmText: 'Override',
										denyText: 'Skip these students',
									},
									templateData: { alerts: this.prepareTemplateDataVisibility(error, body.origin, body.destination) },
									icon: {
										name: 'Eye (Green-White).svg',
										background: '',
									},
								} as ConfirmationTemplates,
							})
							.afterClosed();

						return afterDialogClosed$.pipe(map((override) => ({ override, students: error.students.map((s) => s.User.id) })));
					};

					return errors.pipe(
						tap((errorResponse) => {
							const isVisibilityError = 'visibility_alerts' in errorResponse.error;
							// not our error case? dispatch it to the next retryWhen
							if (!isVisibilityError) {
								throw errorResponse;
							}
							// a student has been checked server side and had no room visibility
							const isRoomsClosed = 'rooms_closed' in errorResponse.error;
							if (!this.forStaff && !isRoomsClosed) {
								const roomNames = errorResponse.error.visibility_alerts.map((r) => r?.location_title ?? '');
								const title = `You don't have access to ${
									roomNames.length > 1 ? 'Rooms ' + roomNames.join(', ') : roomNames[0] === '' ? 'Room' : 'Room ' + roomNames[0]
								}.`;
								this.toastService.openToast({
									title,
									subtitle: 'Please ask your teacher to create a pass for you.',
									type: 'error',
								});

								this.performingAction = false;
								throw 'this student has been subject of room visibility rules';
							}
							// both teachers and students must see as a room is closed only by an admin
							if (isRoomsClosed) {
								const roomNames = errorResponse.error.visibility_alerts.filter((r) => !r.enable).map((r) => r?.location_title ?? '');
								this.toastService.openToast({
									title: 'Room status',
									subtitle: `Closed: ${roomNames.join(',')}`,
									type: 'error',
								});

								this.performingAction = false;
								throw 'room has been closed';
							}
						}),
						concatMap(({ error }) => getOverrideFromDialog(error)),
						concatMap(({ override, students }: { override: boolean; students: number[] }) => {
							if (override === undefined) {
								this.dialogRef.close();
								throw 'confirmation closed';
							}
							if (override === true) {
								body['override_visibility'] = true;
								return of(null);
							}

							if (override === false) {
								remove(body['students'] as number[], (elem) => students.includes(elem));
								// removal left us with no students
								// this is as canceling the process
								if (body['students'].length === 0) {
									/*this.toastService.openToast({
                  title: 'Skiping left no students to operate on',
                  subtitle: 'Last operation did not proceeed',
                  type: 'error',
                });*/
									this.performingAction = false;
									//this.dialogRef.close();
									throw 'no students after skiping';
								}
								return of(null);
							}
						})
					);
				}),
				retryWhen((errors: Observable<HttpErrorResponse>) => {
					return errors.pipe(
						tap((errorResponse: HttpErrorResponse) => {
							if (errorResponse.error?.message !== 'one or more pass limits reached!') {
								throw errorResponse;
							}
						}),
						concatMap((errorResponse) => {
							const students = errorResponse.error.students as { displayName: string; id: number; passLimit: number }[];
							const numPasses = body['students']?.length || 1;
							let headerText: string;
							let buttons: ConfirmationTemplates['buttons'];
							if (numPasses > 1) {
								headerText = `Creating these ${numPasses} passes will exceed the Pass Limits for the following students:`;
								buttons = {
									confirmText: 'Override limits',
									denyText: 'Skip these students',
								};
							} else if (numPasses === 1) {
								const { passLimit } = students[0];
								headerText = `Student's Pass limit reached: ${this.selectedStudents[0].display_name} has had ${passLimit}/${passLimit} passes today`;
								buttons = {
									confirmText: 'Override limit',
									denyText: 'Cancel',
								};
							}

							return this.dialog
								.open(ConfirmationDialogComponent, {
									...RecommendedDialogConfig,
									width: '450px',
									data: {
										headerText,
										buttons,
										body: this.confirmDialog,
										templateData: {
											totalStudents: numPasses,
											limitReachedStudents: students,
										},
										icon: {
											name: 'Pass Limit (White).svg',
											background: '#6651F1',
										},
									} as ConfirmationTemplates,
								})
								.afterClosed()
								.pipe(map((override) => ({ override, students: errorResponse.error.students.map((s) => s.id) })));
						}),
						concatMap(({ override, students }: { override: boolean; students: number[] }) => {
							if (override === undefined) {
								this.dialogRef.close();
								throw new Error('confirmation closed, no options selected');
							}
							if (override === true) {
								body['override'] = true;
								return of(null);
							}

							if (override === false) {
								remove(body['students'] as number[], (elem) => students.includes(elem));
								// server side "no students" case is seen as bad request
								if (body['students'].length === 0) {
									/*this.toastService.openToast({
                  title: 'Skiping left no students to operate on',
                  subtitle: 'Last operation did not proceeed',
                  type: 'error',
                });*/
									this.dialogRef.close();
									throw new Error('No students to create passes for');
								}
								return of(null);
							}
						})
					);
				}),
				catchError((error: HttpErrorResponse) => {
					if (error.error.detail === 'could not create pass' && this.pass.student.status === 'suspended') {
						this.toastService.openToast({
							title: 'Your account is suspended. Please contact your school admin',
							type: 'error',
						});
						return throwError(error);
					}

					this.toastService.openToast({
						title: 'Something went wrong!',
						subtitle: 'Could not create pass, contact support for more info',
						type: 'error',
					});
					return throwError(error);
				})
			)
			.subscribe({
				next: () => {
					this.performingAction = false;
					this.hallPassService.createPassEvent$.next(true);
					this.dialogRef.close();
				},
				error: () => {
					this.performingAction = false;
					this.dialogRef.close();
				},
			});
	}

	cancelEdit(evt: MouseEvent) {
		if (!this.cancelOpen) {
			const target = new ElementRef(evt.currentTarget);
			this.options = [];
			this.header = '';

			if ((this.isActive && this.forStaff) || this.forMonitor) {
				if (this.user.isTeacher() && !this.data['hideReport']) {
					this.options.push(this.genOption('Report Student', '#E32C66', 'report'));
				}
				this.options.push(this.genOption('End Pass', '#E32C66', 'end'));

				this.header = '';
			} else {
				if (this.forInput) {
					this.formState.step = 3;
					this.formState.previousStep = 4;
					this.formService.setFrameMotionDirection('disable');
					this.cardEvent.emit(this.formState);
					return false;
				} else if (this.forFuture) {
					this.options.push(this.genOption('Delete Scheduled Pass', '#E32C66', 'delete', './assets/Delete (Red).svg'));
					this.header = 'Are you sure you want to delete this scheduled pass?';
				}
			}

			UNANIMATED_CONTAINER.next(true);
			this.cancelOpen = true;
			const cancelDialog = this.dialog.open(ConsentMenuComponent, {
				panelClass: 'consent-dialog-container',
				backdropClass: 'invis-backdrop',
				data: { header: this.header, options: this.options, trigger: target },
			});

			cancelDialog
				.afterClosed()
				.pipe(tap(() => UNANIMATED_CONTAINER.next(false)))
				.subscribe((action) => {
					this.chooseAction(action);
				});
		}
	}

	chooseAction(action) {
		this.cancelOpen = false;
		if (action === 'delete') {
			const body = {};
			this.hallPassService.cancelPass(this.pass.id, body).subscribe((httpData) => {
				this.dialogRef.close();
			});
		} else if (action === 'report') {
			this.dialogRef.close({ report: this.pass.student });
		} else if (action === 'end') {
			this.endPass();
		}
	}

	endPass() {
		this.hallPassService.endPassRequest(this.pass.id);
		this.dialogRef.close();
	}

	genOption(display, color, action, icon?) {
		return { display: display, color: color, action: action, icon };
	}

	backdropClick() {
		this.cancelEditClick = false;
	}

	receiveOption(action) {
		this.chooseAction(action);
	}
}
