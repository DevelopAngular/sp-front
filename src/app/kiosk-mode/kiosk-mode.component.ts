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

declare const window;

@Component({
	selector: 'app-kiosk-mode',
	templateUrl: './kiosk-mode.component.html',
	styleUrls: ['./kiosk-mode.component.scss'],
})
export class KioskModeComponent implements OnInit, AfterViewInit, OnDestroy {
	activePassesKiosk: Observable<HallPass[]>;
	waitInLinePasses: Observable<WaitingInLinePass[]>;
	cardReaderValue: string;
	hideInput: boolean;
	destroy$: Subject<any> = new Subject<any>();
	showButtons = new BehaviorSubject(true);
	showScanner = new BehaviorSubject(false);
	invalidId = new BehaviorSubject({
		id: '',
		show: false,
	});

	mainFormRef: MatDialogRef<MainHallPassFormComponent>;
	frontOfWaitInLineDialogRef: MatDialogRef<InlineWaitInLineCardComponent>;
	alreadyOpenedWil: Record<string, boolean> = {};
	showProfilePicture: boolean;

	@ViewChild('input', { read: ElementRef, static: true }) input: ElementRef;

	@HostListener('window:keyup', ['$event'])
	setFocus() {
		this.inputFocus();
	}

	waitInLineTitle: Observable<string> = timer(0, 750).pipe(
		takeUntil(this.destroy$),
		map((count) => `Waiting in Line${'.'.repeat(count % 4)}`)
	);

	applyShakeToReadyWil = (pass: PassLike): string => {
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
		private featureService: FeatureFlagService
	) {}

	get isWaitInLine(): boolean {
		return this.featureService.isFeatureEnabled(FLAGS.WaitInLine);
	}

	get waitInLinePassesPresent() {
		return this.isWaitInLine;
	}

	ngOnInit() {
		if (this.userService.getUserSchool()?.profile_pictures_enabled) {
			this.userService.userData.subscribe({
				next: (user) => {
					this.showProfilePicture = user?.show_profile_pictures === 'everywhere';
				},
			});
		}
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
				filter((res: any[]) => !!res.length),
				takeUntil(this.destroy$)
			)
			.subscribe((locations) => {
				const locationFromStorage = this.kioskMode.getCurrentRoom().value;
				const kioskLocation = locations.find((loc) => parseInt(loc.id, 10) === parseInt(locationFromStorage.id, 10));
				this.titleService.setTitle(`${kioskLocation.title} | SmartPass`);
				this.liveDataService.getMyRoomActivePassesRequest(
					of({ sort: '-created', search_query: '' }),
					{ type: 'location', value: [kioskLocation] },
					this.timeService.nowDate()
				);
				this.kioskMode.setCurrentRoom(kioskLocation);
			});

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

	ngAfterViewInit() {
		this.inputFocus();
		if (window && window.appLoaded) {
			window.appLoaded(1000);
		}
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	inputFocus() {
		setTimeout(() => {
			this.input.nativeElement.focus();
		}, 50);
	}

	cardReader(event: KeyboardEvent) {
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
				switchMap((user: any) => {
					if (user.results.user.length === undefined) {
						return of(user.results.user);
					} else {
						this.notFound(id, true);
						return EMPTY;
					}
				}),
				mergeMap((user) => {
					return combineLatest(of(user), this.passesService.getActivePassesKioskMode(this.kioskMode.getCurrentRoom().value.id));
				}),
				map(([user, passes]) => {
					const myPass = (passes as HallPass[]).find((pass) => pass.student.id === user.id);
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

	onCardReaderBlur() {
		this.inputFocus();
	}

	showMainForm(forLater: boolean, student?): void {
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

	notFound(id: string, show: boolean) {
		this.invalidId.next({ id, show });
		setTimeout(() => {
			this.invalidId.next({ id: '', show: false });
		}, 6000);
	}
}
