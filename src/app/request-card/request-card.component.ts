import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { Util } from '../../Util';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { Navigation } from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import { DataService } from '../services/data-service';
import { catchError, concatMap, filter, finalize, map, pluck, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CreateHallpassFormsComponent } from '../create-hallpass-forms/create-hallpass-forms.component';
import { CreateFormService } from '../create-hallpass-forms/create-form.service';
import { RequestsService } from '../services/requests.service';
import { NextStep, scalePassCards } from '../animations';
import { BehaviorSubject, interval, merge, Observable, of, Subject, throwError } from 'rxjs';

import * as moment from 'moment';
import { isNull, uniq, uniqBy } from 'lodash';
import { ScreenService } from '../services/screen.service';
import { UNANIMATED_CONTAINER } from '../consent-menu-overlay';
import { DeviceDetection } from '../device-detection.helper';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { StorageService } from '../services/storage.service';
import { NavbarDataService } from '../main/navbar-data.service';
import { DomCheckerService } from '../services/dom-checker.service';
import { UserService } from '../services/user.service';
import { School } from '../models/School';
import { LocationsService } from '../services/locations.service';
import { Location } from '../models/Location';
import { ConfirmDeleteKioskModeComponent } from './confirm-delete-kiosk-mode/confirm-delete-kiosk-mode.component';
import { ToastService } from '../services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HallPassesService } from '../services/hall-passes.service';
import { KioskModeService } from '../services/kiosk-mode.service';
import { EncounterPreventionService } from '../services/encounter-prevention.service';

@Component({
	selector: 'app-request-card',
	templateUrl: './request-card.component.html',
	styleUrls: ['./request-card.component.scss'],
	animations: [NextStep, scalePassCards],
})
export class RequestCardComponent implements OnInit, OnDestroy {
	@Input() request: Request;
	@Input() forFuture = false;
	@Input() fromPast = false;
	@Input() forInput = false;
	@Input() forStaff = false;
	@Input() formState: Navigation;

	@Output() cardEvent: EventEmitter<any> = new EventEmitter<any>();
	@Output() scaleCard: EventEmitter<boolean> = new EventEmitter<boolean>();

	@ViewChild('cardWrapper') cardWrapper: ElementRef;
	@ViewChild('PassLimitOverride') overriderBody: TemplateRef<any>;

	selectedDuration: number;
	selectedTravelType: string;
	selectedStudents;
	fromHistory;
	fromHistoryIndex;
	messageEditOpen = false;
	dateEditOpen = false;
	cancelOpen = false;
	pinnableOpen = false;
	user: User;

	isModal: boolean;

	nowTeachers;
	futureTeachers;

	performingAction: boolean;
	frameMotion$: BehaviorSubject<any>;
	options: any[];
	header: string;

	hoverDestroyer$: Subject<any>;

	activeTeacherPin = false;
	solidColorRgba: string;
	solidColorRgba2: string;
	removeShadow: boolean;
	leftTextShadow: boolean;
	kioskModeRestricted: boolean;

	school: School;
	isEnableProfilePictures$: Observable<boolean>;

	scaleCardTrigger$: Observable<string>;

	destroy$: Subject<any> = new Subject<any>();

	constructor(
		public dialogRef: MatDialogRef<RequestCardComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private requestService: RequestsService,
		public dialog: MatDialog,
		public dataService: DataService,
		private createFormService: CreateFormService,
		public screenService: ScreenService,
		private shortcutsService: KeyboardShortcutsService,
		private navbarData: NavbarDataService,
		private storage: StorageService,
		private domCheckerService: DomCheckerService,
		private userService: UserService,
		private locationsService: LocationsService,
		private createPassFormRef: MatDialogRef<CreateHallpassFormsComponent>,
		private toast: ToastService,
		private hallpassService: HallPassesService,
		private kioskService: KioskModeService,
		private encounterService: EncounterPreventionService
	) {}

	get invalidDate() {
		return Util.invalidDate(this.request.request_time);
	}

	get isIOSTablet() {
		return DeviceDetection.isIOSTablet();
	}

	get teacherNames() {
		const destination = this.request.destination;
		const origin = this.request.origin;
		if (this.formState && this.formState.kioskMode) {
			return origin.teachers;
		}
		if (destination.scheduling_request_mode === 'all_teachers_in_room') {
			if (destination.scheduling_request_send_origin_teachers && destination.scheduling_request_send_destination_teachers) {
				return [...destination.teachers, ...origin.teachers];
			} else if (destination.scheduling_request_send_origin_teachers) {
				return origin.teachers;
			} else if (destination.scheduling_request_send_destination_teachers) {
				return destination.teachers;
			}
		}
		return this.request.teachers;
	}

	get filteredTeachers() {
		return uniqBy(this.teacherNames, 'id');
	}

	get iconClass() {
		return this.forStaff || this.invalidDate || (!this.forStaff && !this.forInput && !this.invalidDate) ? '' : 'icon-button';
	}

	get isKioskMode() {
		return this.kioskService.isKisokMode();
	}

	ngOnInit() {
		this.scaleCardTrigger$ = this.domCheckerService.scalePassCard;
		this.frameMotion$ = this.createFormService.getFrameMotionDirection();

		if (this.data['pass']) {
			this.isModal = true;
			this.request = this.data['pass'];
			this.forInput = this.data['forInput'];
			this.forFuture = this.data['forFuture'];
			this.fromPast = this.data['fromPast'];
			this.forStaff = this.data['forStaff'];
			this.selectedStudents = this.data['selectedStudents'];
			this.fromHistory = this.data['fromHistory'];
			this.fromHistoryIndex = this.data['fromHistoryIndex'];
		}

		// TODO: If a pass request is denied and resent, there is no good way to know if we should update the pass request.
		merge(this.requestService.watchRequestDeny(this.request.id), this.requestService.watchRequestUpdate(this.request.id))
			.pipe(takeUntil(this.destroy$))
			.subscribe((request) => {
				this.request = request;
				this.performingAction = false;
			});

		merge(this.requestService.watchRequestCancel(this.request.id), this.requestService.watchRequestAccept(this.request.id))
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.dialogRef.close();
			});

		this.shortcutsService.onPressKeyEvent$.pipe(pluck('key'), takeUntil(this.destroy$)).subscribe((key) => {
			if (key[0] === 'a') {
				this.approveRequest();
			} else if (key[0] === 'd') {
				this.denyRequest('');
			}
		});

		this.userService.user$
			.pipe(
				map((user) => User.fromJSON(user)),
				takeUntil(this.destroy$)
			)
			.subscribe((user) => {
				this.user = user;
			});

		this.isEnableProfilePictures$ = this.userService.isEnableProfilePictures$;

		if (this.isModal) {
			this.solidColorRgba = Util.convertHex(this.request.gradient_color.split(',')[0], 100);
			this.solidColorRgba2 = Util.convertHex(this.request.gradient_color.split(',')[1], 100);
		}

		this.locationsService.getPassLimitRequest();
		this.createFormService
			.getUpdatedChoice()
			.pipe(takeUntil(this.destroy$))
			.subscribe((loc) => {
				console.log(loc);
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
						this.request.destination.title = loc.title;
					} catch (e) {
						console.log(e);
					}
				})
			)
			.subscribe();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	getGradient() {
		if (this.request.gradient_color) {
			const gradient: string[] = this.request.gradient_color.split(',');
			return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
		}
	}

	get studentName() {
		return this.request.student.abbreviatedName(!this.userService.getFeatureFlagNewAbbreviation());
	}

	get teacherName() {
		return this.request.teachers
			.map((t) => {
				return t.isSameObject(this.user) ? 'Me' : t.abbreviatedName();
			})
			.join(', ');
	}

	get gradient() {
		return 'radial-gradient(circle at 73% 71%, ' + this.request.color_profile.gradient_color + ')';
	}

	get status() {
		return this.request.status.charAt(0).toUpperCase() + this.request.status.slice(1);
	}

	get isFutureOrNowTeachers() {
		const to = this.formState.data.direction.to;
		if (
			(!this.formState.forLater && to.request_mode !== 'any_teacher') ||
			(this.formState.forLater && to.scheduling_request_mode !== 'any_teacher')
		) {
			return (
				(to &&
					((!this.formState.forLater && to.request_mode === 'all_teachers_in_room') ||
						to.request_mode === 'specific_teachers' ||
						(to.request_mode === 'teacher_in_room' && to.teachers.length === 1))) ||
				(this.formState.forLater && to.scheduling_request_mode === 'all_teachers_in_room') ||
				to.scheduling_request_mode === 'specific_teachers' ||
				(to.scheduling_request_mode === 'teacher_in_room' && to.teachers.length === 1)
			);
		}
	}

	generateTeachersToRequest() {
		const to = this.formState.data.direction.to;
		if (!this.forFuture) {
			if (to.request_mode === 'all_teachers_in_room') {
				if (to.request_send_destination_teachers && to.request_send_origin_teachers) {
					this.nowTeachers = [...this.formState.data.direction.to.teachers, ...this.formState.data.direction.from.teachers];
				} else if (to.request_send_destination_teachers) {
					this.nowTeachers = this.formState.data.direction.to.teachers;
				} else if (to.request_send_origin_teachers) {
					this.nowTeachers = this.formState.data.direction.from.teachers;
				}
			} else if (to.request_mode === 'specific_teachers' && this.request.destination.request_teachers.length === 1) {
				this.nowTeachers = to.request_teachers;
			} else if (to.request_mode === 'specific_teachers' || to.request_mode === 'teacher_in_room') {
				this.nowTeachers = this.request.teachers;
			}
		} else {
			if (to.scheduling_request_mode === 'all_teachers_in_room') {
				if (to.scheduling_request_send_origin_teachers && to.scheduling_request_send_destination_teachers) {
					this.futureTeachers = [...this.formState.data.direction.to.teachers, ...this.formState.data.direction.from.teachers];
				} else if (to.scheduling_request_send_origin_teachers) {
					this.futureTeachers = this.formState.data.direction.from.teachers.length
						? this.formState.data.direction.from.teachers
						: this.formState.data.direction.to.teachers;
				} else if (to.scheduling_request_send_destination_teachers) {
					this.futureTeachers = this.formState.data.direction.to.teachers;
				}
			} else if (to.scheduling_request_mode === 'specific_teachers' && this.request.destination.scheduling_request_teachers.length === 1) {
				this.futureTeachers = this.request.destination.scheduling_request_teachers;
			} else if (to.scheduling_request_mode === 'specific_teachers' && this.request.destination.scheduling_request_teachers.length > 1) {
				this.futureTeachers = this.request.teachers;
			} else if (to.scheduling_request_mode === 'teacher_in_room' && to.teachers.length === 1) {
				this.futureTeachers = this.request.teachers;
			}
		}
	}

	formatDateTime(date: Date, timeOnly?: boolean) {
		if (date instanceof Date) {
			return Util.formatDateTime(date, timeOnly);
		}
		return '';
	}

	newRequest() {
		this.performingAction = true;
		this.generateTeachersToRequest();
		const body: any = this.forFuture
			? {
					origin: this.request.origin.id,
					destination: this.request.destination.id,
					attachment_message: this.request.attachment_message,
					travel_type: this.selectedTravelType,
					request_time: this.request.request_time.toISOString(),
					duration: this.selectedDuration * 60,
			  }
			: {
					origin: this.request.origin.id,
					destination: this.request.destination.id,
					attachment_message: this.request.attachment_message,
					travel_type: this.selectedTravelType,
					duration: this.selectedDuration * 60,
			  };

		if (this.isFutureOrNowTeachers && !this.formState.kioskMode) {
			if (this.forFuture) {
				body.teachers = uniq(this.futureTeachers.map((t) => t.id));
			} else {
				body.teachers = uniq(this.nowTeachers.map((t) => t.id));
			}
		} else {
			body.teachers = uniq(this.request.teachers.map((t) => t.id));
			if (this.formState.kioskMode) {
				body.student_id = this.formState.data.kioskModeStudent.id;
			}
		}

		if (this.forStaff) {
			const invitation = {
				students: this.request.student.id,
				default_origin: this.request.origin.id,
				destination: +this.request.destination.id,
				date_choices: [new Date(this.formState.data.date.date).toISOString()],
				duration: this.request.duration,
				travel_type: this.request.travel_type,
			};

			this.requestService
				.createInvitation(invitation)
				.pipe(
					takeUntil(this.destroy$),
					switchMap(() => {
						return this.requestService.cancelRequest(this.request.id);
					}),
					catchError((error) => {
						this.openErrorToast(error);
						return of(error);
					})
				)
				.subscribe(() => {
					this.performingAction = true;
					this.dialogRef.close();
				});
		} else {
			this.requestService
				.createRequest(body)
				.pipe(
					takeUntil(this.destroy$),
					switchMap((res: Request) => {
						this.request = res;
						this.forInput = false;
						this.kioskModeRestricted = true;
						if (this.formState.kioskMode) {
							this.createPassFormRef.disableClose = true;
						}
						return this.formState.previousStep === 1
							? this.requestService.cancelRequest(this.request.id)
							: this.formState.missedRequest
							? this.requestService.cancelInvitation(this.formState.data.request.id, '')
							: of(null);
					}),
					catchError((error) => {
						this.openErrorToast(error);
						return of(error);
					})
				)
				.subscribe(
					() => {
						this.performingAction = true;
						if (!this.formState.kioskMode) {
							if ((DeviceDetection.isAndroid() || DeviceDetection.isIOSMobile()) && this.forFuture) {
								this.dataService.openRequestPageMobile();
								this.navbarData.inboxClick$.next(true);
							}
							this.dialogRef.close();
						}
					},
					() => {
						this.performingAction = false;
					}
				);
		}
	}

	openErrorToast(error) {
		this.toast.openToast(
			{
				title: 'Oh no! Something went wrong',
				subtitle: `Please try refreshing the page. If the issue keeps occuring, contact us at support@smartpass.app. (${error.status})`,
				type: 'error',
			},
			`${error.status}`
		);
	}

	changeDate(resend_request?: boolean) {
		if (!this.dateEditOpen) {
			this.dateEditOpen = true;
			let config;
			this.dialogRef.close();
			config = {
				panelClass: 'form-dialog-container',
				maxWidth: '100vw',
				backdropClass: 'custom-backdrop',
				data: {
					entryState: {
						step: 1,
						state: 1,
					},
					forInput: false,
					originalToLocation: this.request.destination,
					colorProfile: this.request.color_profile,
					originalFromLocation: this.request.origin,
					request_time: resend_request || this.invalidDate ? new Date() : this.request.request_time,
					request: this.request,
					resend_request: resend_request,
				},
			};
			const dateDialog = this.dialog.open(CreateHallpassFormsComponent, config);

			dateDialog
				.afterClosed()
				.pipe(
					tap(() => (this.dateEditOpen = false)),
					filter((state) => resend_request && state),
					switchMap((state) => {
						const body: any = {
							origin: this.request.origin.id,
							destination: this.request.destination.id,
							attachment_message: this.request.attachment_message,
							travel_type: this.request.travel_type,
							teachers: this.request.teachers.map((u) => u.id),
							duration: this.request.duration,
							request_time: moment(state.data.date.date).toISOString(),
						};

						return this.requestService.createRequest(body);
					}),
					switchMap(() => this.requestService.cancelRequest(this.request.id)),
					catchError((error) => {
						this.openErrorToast(error);
						return of(error);
					})
				)
				.subscribe();
		}
	}

	editMessage() {
		if (!this.messageEditOpen) {
			this.messageEditOpen = true;
			const infoDialog = this.dialog.open(CreateHallpassFormsComponent, {
				width: '750px',
				maxWidth: '100vw',
				panelClass: 'form-dialog-container',
				backdropClass: 'invis-backdrop',
				data: {
					entryState: 'restrictedMessage',
					originalMessage: this.request.attachment_message,
					originalToLocation: this.request.destination,
					colorProfile: this.request.color_profile,
					originalFromLocation: this.request.origin,
				},
			});

			infoDialog.afterClosed().subscribe((data) => {
				this.request.attachment_message = data['message'] === '' ? this.request.attachment_message : data['message'];
				this.messageEditOpen = false;
			});
		}
	}

	cancelRequest(evt: MouseEvent) {
		if (this.formState && this.formState.kioskMode && !this.forInput) {
			const CD = this.dialog.open(ConfirmDeleteKioskModeComponent, {
				panelClass: 'overlay-dialog',
			});

			CD.afterClosed().subscribe((action) => {
				if (action === 'delete') {
					this.chooseAction(action);
				}
			});
		} else {
			if (!this.cancelOpen) {
				const target = new ElementRef(evt.currentTarget);
				this.options = [];
				this.header = '';
				if (!this.forInput) {
					if (this.forStaff) {
						this.options.push(this.genOption('Attach Message & Deny', '#7f879d', 'deny_with_message', './assets/Message (Blue-Gray).svg'));
						this.options.push(
							this.genOption('Deny Pass Request', '#E32C66', 'deny', './assets/Cancel (Red).svg', 'rgba(227, 44, 102, .1)', 'rgba(227, 44, 102, .15)')
						);
					} else {
						if (this.invalidDate) {
							this.options.push(this.genOption('Change Date & Time to Resend', '#7f879d', 'change_date'));
						}
						this.options.push(
							this.genOption(
								'Delete Pass Request',
								'#E32C66',
								'delete',
								'./assets/Delete (Red).svg',
								'rgba(227, 44, 102, .1)',
								'rgba(227, 44, 102, .15)'
							)
						);
					}
					this.header =
						'Are you sure you want to ' + (this.forStaff ? 'deny' : 'delete') + ' this pass request' + (this.forStaff ? '' : ' you sent') + '?';
				} else {
					if (!this.pinnableOpen) {
						this.formState.step = this.formState.previousStep === 1 ? 1 : 3;
						this.formState.previousStep = 4;
						this.createFormService.setFrameMotionDirection('disable');
						this.cardEvent.emit(this.formState);
					}
					return false;
				}

				UNANIMATED_CONTAINER.next(true);
				this.cancelOpen = true;
				const cancelDialog = this.dialog.open(ConsentMenuComponent, {
					panelClass: 'consent-dialog-container',
					backdropClass: 'invis-backdrop',
					data: { header: this.header, options: this.options, trigger: target, adjustForScroll: true },
				});

				cancelDialog
					.afterClosed()
					.pipe(tap(() => UNANIMATED_CONTAINER.next(false)))
					.subscribe((action) => {
						this.chooseAction(action);
					});
			}
		}
	}

	chooseAction(action) {
		this.cancelOpen = false;
		if (action === 'cancel' || action === 'stop') {
			this.dialogRef.close();
		} else if (action === 'editMessage') {
			this.editMessage();
		} else if (action === 'deny_with_message') {
			let denyMessage = '';
			if (action.indexOf('Message') > -1) {
			} else {
				this.messageEditOpen = true;
				let config;
				config = {
					panelClass: 'form-dialog-container',
					backdropClass: 'invis-backdrop',
					data: {
						forInput: false,
						entryState: { step: 3, state: 5 },
						teachers: this.request.teachers.map((u) => u.id),
						originalMessage: '',
						originalToLocation: this.request.destination,
						colorProfile: this.request.color_profile,
						gradient: this.request.gradient_color,
						originalFromLocation: this.request.origin,
						isDeny: true,
						studentMessage: this.request.attachment_message,
					},
				};
				const messageDialog = this.dialog.open(CreateHallpassFormsComponent, config);

				messageDialog
					.afterClosed()
					.pipe(filter((res) => !!res))
					.subscribe((matData) => {
						if (isNull(matData.data.message)) {
							this.messageEditOpen = false;
							return;
						}
						if (matData.data && matData.data.message) {
							denyMessage = matData.data.message;
							this.messageEditOpen = false;
							console.log('DENIED =====>', matData, action);
							this.denyRequest(denyMessage);
						} else {
							denyMessage = matData.message;
							this.messageEditOpen = false;
							this.denyRequest(denyMessage);
						}
					});
				return;
			}
		} else if (action === 'deny') {
			this.denyRequest('No message');
		} else if (action === 'delete') {
			this.requestService
				.cancelRequest(this.request.id)
				.pipe(
					takeUntil(this.destroy$),
					catchError((error) => {
						this.openErrorToast(error);
						return of(error);
					})
				)
				.subscribe(() => {
					const storageData = JSON.parse(this.storage.getItem('pinAttempts'));
					if (storageData && storageData[this.request.id]) {
						delete storageData[this.request.id];
						this.storage.setItem('pinAttempts', JSON.stringify({ ...storageData }));
					}
					this.dialogRef.close();
				});
		} else if (action === 'change_date') {
			this.changeDate(true);
		}
	}

	denyRequest(denyMessage: string) {
		const body = {
			message: denyMessage,
		};
		this.requestService
			.denyRequest(this.request.id, body)
			.pipe(
				takeUntil(this.destroy$),
				catchError((error) => {
					this.openErrorToast(error);
					return of(error);
				})
			)
			.subscribe((httpData) => {
				this.dialogRef.close();
			});
	}

	genOption(display, color, action, icon?, hoverBackground?, clickBackground?) {
		return { display, color, action, icon, hoverBackground, clickBackground };
	}

	approveRequest() {
		this.performingAction = true;

		this.requestService
			.checkLimits({}, this.request, this.overriderBody)
			.pipe(
				concatMap((httpBody) => {
					return this.requestService.acceptRequest(this.request, httpBody);
				}),
				catchError((error) => {
					if (error instanceof HttpErrorResponse && error.error?.conflict_student_ids) {
						return this.encounterService.getExclusionGroups({ student: error.error?.conflict_student_ids }).pipe(
							map((exclusionGroups) => {
								this.hallpassService.showEncounterPreventionToast({
									exclusionPass: this.request,
									isStaff: this.forStaff,
									exclusionGroups,
								});
								return throwError(error);
							})
						);
					}

					return throwError(error);
				}),
				finalize(() => (this.performingAction = false))
			)
			.subscribe({
				next: () => this.dialogRef.close(),
				error: (err: Error) => {
					this.openErrorToast(err);
					console.error(err);
				},
			});
	}

	onHover(evt: HTMLElement, container: HTMLElement) {
		this.hoverDestroyer$ = new Subject<any>();
		const target = evt;
		target.style.width = `auto`;
		target.style.transition = `none`;

		const targetWidth = target.getBoundingClientRect().width;
		const containerWidth = container.getBoundingClientRect().width;

		let margin = 0;
		interval(35)
			.pipe(takeUntil(this.hoverDestroyer$))
			.subscribe(() => {
				if (margin > 0) {
					this.leftTextShadow = true;
				}
				if (targetWidth - margin > containerWidth) {
					target.style.marginLeft = `-${margin}px`;
					margin++;
				} else {
					this.removeShadow = true;
				}
			});
	}

	onLeave(target: HTMLElement) {
		target.style.marginLeft = this.filteredTeachers.length > 1 ? '0px' : '15px';
		target.style.transition = `margin-left .4s ease`;
		target.style.width = `auto`;
		this.removeShadow = false;
		this.leftTextShadow = false;
		this.hoverDestroyer$.next();
		this.hoverDestroyer$.complete();
	}

	goToPin() {
		this.activeTeacherPin = true;
	}

	handlePinResult(teacherPinResponse: any) {
		if (teacherPinResponse === 'encounter prevention') {
			this.activeTeacherPin = false;
			return;
		}
		this.dialogRef.close();
	}

	resendRequest() {
		const body: any = {
			origin: this.request.origin.id,
			destination: this.request.destination.id,
			attachment_message: this.request.attachment_message,
			travel_type: this.request.travel_type,
			teachers: this.request.teachers.map((u) => parseInt(u.id, 10)),
			duration: this.request.duration,
			student_id: this.formState.data.kioskModeStudent.id,
		};

		const preRequestStatus = this.request.status;
		this.request.status = 'pending';

		this.requestService.createRequest(body).subscribe({
			next: () => {
				console.log('pass request resent');
			},
			error: (err) => {
				console.error('While resending a pass request: ', err);
				this.request.status = preRequestStatus;
			},
		});
	}
}
