import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { KioskModeService, KioskSettings } from '../services/kiosk-mode.service';
import { LiveDataService } from '../live-data/live-data.service';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of, Subject, throwError, timer } from 'rxjs';
import { UserService } from '../services/user.service';
import { HallPassesService } from '../services/hall-passes.service';
import { HallPass } from '../models/HallPass';
import { catchError, filter, map, mergeMap, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { LocationsService } from '../services/locations.service';
import { TimeService } from '../services/time.service';
import { KioskSettingsDialogComponent } from '../kiosk-settings-dialog/kiosk-settings-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { MainHallPassFormComponent } from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import { Title } from '@angular/platform-browser';
import { Location } from '../models/Location';
import { FeatureFlagService, FLAGS } from '../services/feature-flag.service';
import { sortWil } from '../services/wait-in-line.service';
import { WaitingInLinePass } from '../models/WaitInLine';
import { InlineWaitInLineCardComponent } from '../pass-cards/inline-wait-in-line-card/inline-wait-in-line-card.component';
import { PassLike } from '../models';
import { Pinnable } from '../models/Pinnable';
import { ToastService } from '../services/toast.service';

declare const window;

@Component({
	selector: 'app-kiosk-mode',
	templateUrl: './kiosk-mode.component.html',
	styleUrls: ['./kiosk-mode.component.scss'],
})
export class KioskModeComponent implements OnInit, AfterViewInit, OnDestroy {
	public activePassesKiosk: Observable<HallPass[]>;
	public waitInLinePasses: Observable<WaitingInLinePass[]>;
	public cardReaderValue: string;
	public hideInput: boolean;
	private destroy$: Subject<any> = new Subject<any>();
	private pinnables$: Observable<Pinnable[]> = this.passesService.getPinnablesRequest().pipe(filter((r: Pinnable[]) => !!r.length));
	private pinnable: Pinnable;
	private currentLocation: Location;
	private showAsOriginRoom: boolean = true;

	public showProfilePicture: boolean = false;
	public waitInLinePassesEnabled: boolean = false;
	public showButtons: BehaviorSubject<boolean> = new BehaviorSubject(true);
	public showScanner: BehaviorSubject<boolean> = new BehaviorSubject(false);
	public invalidId: BehaviorSubject<{ id: string; show: boolean }> = new BehaviorSubject({
		id: '',
		show: false,
	});

	mainFormRef: MatDialogRef<MainHallPassFormComponent>;
	frontOfWaitInLineDialogRef: MatDialogRef<InlineWaitInLineCardComponent>;
	alreadyOpenedWil: Record<string, boolean> = {};

	@ViewChild('input', { read: ElementRef, static: true }) input: ElementRef;

	@HostListener('window:keyup', ['$event'])
	setFocus() {
		this.inputFocus();
	}

	public waitInLineTitle: Observable<string> = timer(0, 750).pipe(
		takeUntil(this.destroy$),
		map((count) => `Waiting in Line${'.'.repeat(count % 4)}`)
	);

	public applyShakeToReadyWil = (pass: PassLike): string => {
		if (!(pass instanceof WaitingInLinePass)) {
			return '';
		}

		return pass.isReadyToStart() ? 'shake-ready-wil' : '';
	};

	constructor(
		private dialog: MatDialog,
		private kioskMode: KioskModeService,
		private locationService: LocationsService,
		private liveDataService: LiveDataService,
		private userService: UserService,
		private passesService: HallPassesService,
		private timeService: TimeService,
		private activatedRoute: ActivatedRoute,
		private titleService: Title,
		private featureService: FeatureFlagService,
		private toast: ToastService
	) {}

	public ngOnInit(): void {
		this.waitInLinePassesEnabled = this.featureService.isFeatureEnabled(FLAGS.WaitInLine);

		// opens "learn more" link in show as origin error toast
		this.toast.toastButtonClick$.pipe(filter((action) => action === 'update_show_as_origin')).subscribe((res) => {
			window.open('https://www.smartpass.app/show-as-origin-room', '_blank');
		});

		const profilePicturesEnabled = this.userService.getUserSchool()?.profile_pictures_enabled;

		if (profilePicturesEnabled) {
			this.userService.userData.subscribe({
				next: (user) => {
					this.showProfilePicture = user?.show_profile_pictures === 'everywhere' || user?.show_profile_pictures === 'hall_monitor';
				},
			});
		}

		this.userService.userData.subscribe();
		this.activatedRoute.data.subscribe((state) => {
			if ('openDialog' in state && state.openDialog) {
				this.dialog.open(KioskSettingsDialogComponent, {
					panelClass: 'sp-form-dialog',
					width: '425px',
					height: '500px',
				});
			}
		});

		this.locationService.getPassLimitRequest();
		combineLatest(this.userService.user$.pipe(startWith(null)), this.userService.effectiveUser.pipe(filter((r) => !!r)).pipe(startWith(null)))
			.pipe(
				switchMap(([user, effectiveUser]) => {
					const kioskLocation: Location = user?.extras?.dedicated_kiosk_location ?? effectiveUser?.user?.extras?.dedicated_kiosk_location;
					if (kioskLocation) {
						return of([kioskLocation]);
					}

					if (effectiveUser) {
						return this.locationService.getLocationsWithTeacherRequest(effectiveUser.user);
					}
					if (user) {
						return this.locationService.getLocationsWithTeacherRequest(user);
					}
					return of([]);
				}),
				filter((res: Location[]) => !!res.length),
				tap((res: Location[]) => {
					const locationFromStorage = this.kioskMode.getCurrentRoom().value;
					this.currentLocation = res.find((loc) => loc.id === locationFromStorage.id);
					this.titleService.setTitle(`${this.currentLocation.title} | SmartPass`);
					this.liveDataService.getMyRoomActivePassesRequest(
						of({ sort: '-created', search_query: '' }),
						{ type: 'location', value: [this.currentLocation] },
						this.timeService.nowDate()
					);
					this.kioskMode.setCurrentRoom(this.currentLocation);
				}),
				switchMap(() => {
					return this.pinnables$;
				}),
				// check if pinnable's show as origin room setting is false
				// to show a toast if the user tries to create a pass.
				tap((pinnables: Pinnable[]) => {
					if (this.currentLocation.category) {
						this.pinnable = pinnables.find((p: Pinnable) => p.category === this.currentLocation.category);
					} else {
						this.pinnable = pinnables.find((p: Pinnable) => p.location.id === this.currentLocation.id);
					}
					this.showAsOriginRoom = this.pinnable?.show_as_origin_room;
				}),
				// listen for the pinnable's show as origin room setting being changed
				// to show a toast if the user tries to create a pass.
				switchMap(() => {
					return this.locationService.listenPinnableSocket();
				}),
				tap((res) => {
					if (this.pinnable.id === res.data.id) {
						this.locationService.updatePinnableSuccessState((res.data as Pinnable));
						this.showAsOriginRoom = (res.data as Pinnable).show_as_origin_room;
					}
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();

		this.activePassesKiosk = this.liveDataService.myRoomActivePasses$;
		this.waitInLinePasses = this.kioskMode.getCurrentRoom().pipe(
			filter(Boolean),
			switchMap((location: Location) => this.liveDataService.watchWaitingInLinePasses({ type: 'origin', value: location })),
			map((passes) => passes.sort(sortWil)),
			tap((passes) => {
				if (passes.length === 0) {
					return;
				}
				if (
					!(passes[0].id in this.alreadyOpenedWil) &&
					passes[0].isReadyToStart() &&
					this.frontOfWaitInLineDialogRef?.getState() !== MatDialogState.OPEN
				) {
					this.alreadyOpenedWil[passes[0].id] = true;
					this.frontOfWaitInLineDialogRef = this.dialog.open(InlineWaitInLineCardComponent, {
						panelClass: ['teacher-pass-card-dialog-container'],
						backdropClass: 'custom-backdrop',
						disableClose: false,
						closeOnNavigation: true,
						data: {
							nextInLine: true,
							pass: passes[0],
							forStaff: false,
							forKiosk: true,
						},
					});
				}
			}),
			catchError((error) => {
				console.warn('No more updates to WIL passes because of the following:');
				console.error(error);
				return throwError(error);
			})
		);

		/**
		 * The following listener is responsible for checking if incoming hall passes are the result
		 * of an accepted pass requests.
		 *
		 * If there are more than one hall pass, and the dialog is currently opened, the pinnable key
		 * inside MainHallPassFormComponent.FORM_STATE will represent a pass request.
		 * If the origin id, destination id and student id are the same then the incoming hall pass was
		 * created from the pass request in the dialog, and therefore we can close the dialog
		 */
		this.liveDataService.myRoomActivePasses$
			.pipe(filter((passes) => passes.length > 0 && this.mainFormRef?.getState() === MatDialogState.OPEN))
			.subscribe({
				next: (passes) => {
					const formState = this.mainFormRef?.componentInstance?.FORM_STATE;
					if (formState?.data.direction?.pinnable && formState?.data.kioskModeStudent) {
						const requestMatch = passes.filter(
							(p) =>
								p.origin.id == formState.data.direction.from.id &&
								p.destination.id == formState.data.direction.to.id &&
								p.student.id == formState.data.kioskModeStudent.id
						);
						if (requestMatch.length > 0) {
							this.mainFormRef.close();
						}
					}
				},
			});

		this.kioskMode.getKioskModeSettingsSubject().subscribe((settings: KioskSettings) => {
			this.showButtons.next(settings.findById || settings.findByName);
			this.showScanner.next(settings.findByScan);
		});
	}

	public ngAfterViewInit(): void {
		this.inputFocus();
		if (window && window.appLoaded) {
			window.appLoaded(1000);
		}
	}

	public ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private inputFocus(): void {
		setTimeout(() => {
			this.input.nativeElement.focus();
		}, 50);
	}

	public cardReader(event: KeyboardEvent): void {
		if (event.key !== 'Enter') {
			return;
		}
		let id = this.cardReaderValue;

		if (this.cardReaderValue && (this.cardReaderValue[0] === ';' || this.cardReaderValue[0] === '%')) {
			id = id.substring(1);
		}

		this.userService
			.possibleProfileByCustomId(id)
			.pipe(
				switchMap((customIdResponse) => {
					let { user } = customIdResponse.results;

					/**
					 * Why are we doing this filter?
					 *
					 * It seems the backend will return { results: { user: [null] } } if a user isn't found when searching by
					 * custom ID. Not really an ideal response from the backend, this will be patched very soon
					 */
					user = user.filter(Boolean);

					if (user.length > 0) {
						return of(user[0]);
					}

					this.notFound(id, true);
					return EMPTY;
				}),
				mergeMap((user) => {
					return combineLatest(of(user), this.passesService.getActivePassesKioskMode(this.kioskMode.getCurrentRoom().value.id));
				}),
				map(([user, passes]) => {
					const myPass: HallPass = (passes as HallPass[]).find((pass: HallPass) => pass.student.id === user.id);
					if (myPass) {
						this.passesService
							.endPass(myPass.id)
							.toPromise()
							.then(() => {
								// this.showMainForm(false, [user]);
								return of(null);
							});
					} else {
						this.showMainForm(false, [user]);
						return of(null);
					}
				})
			)
			.subscribe();
		this.cardReaderValue = '';
	}

	public onCardReaderBlur(): void {
		this.inputFocus();
	}

	public showMainForm(forLater: boolean, student?): void {
		// don't allow creating a pass if the room does not have show as origin room setting set to true.
		if (!this.showAsOriginRoom) {
			this.toast.openToast({
				title: 'Passes cannot be created on this kiosk',
				subtitle: 'This room is only allowed as a destination, and therefore cannot become a kiosk.',
				showButton: true,
				action: 'update_show_as_origin',
				buttonText: 'Learn more.',
				type: 'error',
			});
			return;
		}

		this.hideInput = true;
		this.mainFormRef = this.dialog.open(MainHallPassFormComponent, {
			panelClass: 'main-form-dialog-container',
			maxWidth: '100vw',
			backdropClass: 'custom-backdrop',
			data: {
				forLater: forLater,
				forStaff: true,
				forInput: true,
				kioskMode: true,
				kioskModeRoom: this.kioskMode.getCurrentRoom().value,
				kioskModeSelectedUser: student,
			},
		});

		this.mainFormRef.afterClosed().subscribe(() => {
			this.hideInput = false;
			this.inputFocus();
		});
	}

	private notFound(id: string, show: boolean): void {
		this.invalidId.next({ id, show });
		setTimeout(() => {
			this.invalidId.next({ id: '', show: false });
		}, 6000);
	}
}
