import {
	Component,
	ElementRef,
	Inject,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Optional,
	QueryList,
	SimpleChange,
	SimpleChanges,
	TemplateRef,
	ViewChild,
	ViewChildren,
} from '@angular/core';
import { BehaviorSubject, from, interval, Observable, of, Subject, throwError, timer } from 'rxjs';
import { Navigation } from '../../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import { Pinnable } from '../../models/Pinnable';
import { HttpService } from '../../services/http-service';
import { DataService } from '../../services/data-service';
import { HallPassErrors, HallPassesService } from '../../services/hall-passes.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ScreenService } from '../../services/screen.service';
import { DeviceDetection } from '../../device-detection.helper';
import { WaitingInLinePass } from '../../models/WaitInLine';
import { catchError, concatMap, filter, finalize, map, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { MatRipple } from '@angular/material/core';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
import { Util } from '../../../Util';
import { KioskModeService } from '../../services/kiosk-mode.service';
import { LocationsService } from '../../services/locations.service';
import { Title } from '@angular/platform-browser';
import { CreateFormService } from '../../create-hallpass-forms/create-form.service';
import { User } from '../../models/User';
import { UserService } from '../../services/user.service';
import { WaitInLineService } from '../../services/wait-in-line.service';
import { TimerSpinnerComponent } from '../../core/components/timer-spinner/timer-spinner.component';
import { EncounterPreventionService } from '../../services/encounter-prevention.service';

export enum WILHeaderOptions {
	Delete = 'delete',
	Start = 'start',
}

/**
 * Wait in Line has 2 parts, similar to the pass request flow:
 * 1. Wait in Line Creation (queuing a student in line)
 * 2. Wait in Line Acceptance (starting the pass for a student at the front of the line)
 *
 * This component deals with the different stages waiting in line until the pass is created.
 * This component is a result of the WaitInLineCardComponent creating a Wait In Line object
 * on the server side.
 *
 * 1. Get the current position in the line and display this position
 * 2. When at the front of the line, fullscreen this component and pulse the "Start Pass" button.
 *    The student has 30 seconds to create the pass.
 * 3. Failing to create a pass before the timer expires kicks the student to the back of the line.
 *    Failing to create a pass the second time deletes the Wait In Line Card and kicks the student out of the line.
 * 4. If the student creates the pass, regular checks are done (student pass limits mainly) and the pass is created.
 * 5. This component is destroyed.
 *
 * // TODO: API Call and Listeners for Line Position
 * // TODO: Pass checks before creating pass
 */
@Component({
	selector: 'app-inline-wait-in-line-card',
	templateUrl: './inline-wait-in-line-card.component.html',
	styleUrls: ['./inline-wait-in-line-card.component.scss'],
})
export class InlineWaitInLineCardComponent implements OnInit, OnChanges, OnDestroy {
	@Input() wil: WaitingInLinePass;
	@Input() forStaff: boolean;

	@ViewChildren(TimerSpinnerComponent) timeSpinner: QueryList<TimerSpinnerComponent>;
	@ViewChild('waitingDots') set dotsSpan(span: ElementRef<HTMLSpanElement>) {
		if (!span) {
			return;
		}

		timer(0, 750)
			.pipe(
				takeUntil(this.destroy$),
				tap((count) => {
					span.nativeElement.innerText = '.'.repeat(count % 4);
					count++;
				})
			)
			.subscribe();
	}
	@ViewChild('root') set root(root: TemplateRef<any>) {
		if (!root) {
			return;
		}

		this.templateRoot = root;
		if (this.position === 0 && !this.firstInLinePopupRef) {
			this.openBigPassCard();
		}
	}
	@ViewChildren('rootWrapper') set wrapperElem(wrappers: QueryList<ElementRef<HTMLElement>>) {
		if (!wrappers) {
			return;
		}

		let elem = wrappers.last.nativeElement;
		if (!elem) {
			return;
		}

		while (!elem.classList.contains('cdk-overlay-pane')) {
			elem = elem.parentElement;
		}

		if (this.user.isTeacher() && !this.isKiosk) {
			return;
		}

		if (this.isKiosk && this.wil.isFrontOfLine()) {
			return;
		}

		if (this.showBigCard) {
			// document.querySelector<HTMLDivElement>('.cdk-overlay-pane').style.transform = `scale(${this.scalingFactor})`;
			elem.style.transform = `scale(${this.scalingFactor})`;
			return;
		}

		if (!this.firstInLinePopup) {
			return;
		}

		// document.querySelector<HTMLDivElement>('.cdk-overlay-pane').style.transform = `scale(${this.scalingFactor})`;
		elem.style.transform = `scale(${this.scalingFactor})`;
	}
	@ViewChildren(MatRipple) set constantRipple(ripples: QueryList<MatRipple>) {
		if (!ripples?.length) {
			return;
		}

		timer(1000, 2500)
			.pipe(
				takeWhile(() => ripples?.length > 0),
				takeUntil(this.destroy$)
			)
			.subscribe(() => {
				// second ripple on popup doesn't seem to work well due to transform scaling issue
				// ripples.forEach(ripple => {
				//   const rippleRef = ripple.launch({
				//     persistent: true,
				//     centered: true
				//   });
				//   rippleRef.fadeOut();
				// })

				const rippleRef = ripples.first.launch({
					persistent: true,
					centered: true,
				});
				rippleRef.fadeOut();
			});
	}

	gradient: string;
	valid: boolean = true;
	overlayWidth: string = '0px';
	buttonWidth: number = 288;
	isMobile = DeviceDetection.isMobile();
	requestLoading = false;
	templateRoot: TemplateRef<any>;

	frameMotion$: BehaviorSubject<any>;
	destroy$: Subject<any> = new Subject<any>();
	acceptingPassTimeRemaining: number;
	firstInLinePopup = false;
	firstInLinePopupRef: MatDialogRef<TemplateRef<any>>;
	user: User;
	currentDate = interval(1000).pipe(map(() => new Date())); // less CD cycles and better pipe caching

	public FORM_STATE: Navigation;
	pinnable: Pinnable;

	constructor(
		@Optional() private dialogRef: MatDialogRef<InlineWaitInLineCardComponent>,
		@Optional() @Inject(MAT_DIALOG_DATA) public dialogData: { pass: WaitingInLinePass; forStaff: boolean },
		private titleService: Title,
		private http: HttpService,
		private dataService: DataService,
		private userService: UserService,
		private formService: CreateFormService,
		private locationsService: LocationsService,
		private hallPassService: HallPassesService,
		private dialog: MatDialog,
		private screen: ScreenService,
		public kioskService: KioskModeService,
		private wilService: WaitInLineService,
		private encounterService: EncounterPreventionService
	) {
		if (this.dialogData?.pass instanceof WaitingInLinePass) {
			// it's not enough for the JSON to have the data, it must be an instance of the class
			this.wil = this.dialogData.pass;
		}
	}

	private get scalingFactor() {
		if (this.isMobile) {
			return 1.15;
		}
		let targetHeight = document.documentElement.clientHeight * 0.85;
		if (this.openedFromPassTile) {
			targetHeight -= 200; // make space for app-student-passes under the dialog tile
		}
		return targetHeight / 412; // 412 is defined height of this component according to the design system
	}

	get openedFromPassTile(): boolean {
		return !!this.dialogRef && !!this.dialogData.pass;
	}

	get optionsIcon() {
		return this.forStaff && !this.isKiosk ? './assets/Dots (Transparent).svg' : './assets/Delete (White).svg';
	}

	get position(): number {
		return this.wil.line_position;
	}

	get showBigCard() {
		return this.wil.isReadyToStart() || this.openedFromPassTile;
	}

	get getUserName() {
		return this.wil.issuer.id == this.user.id ? 'Me' : this.wil.issuer.username;
	}

	get isKiosk() {
		return this.kioskService.isKisokMode();
	}

	ngOnChanges(changes: SimpleChanges) {
		console.log(changes);
		if (this.timeSpinner?.length > 0) {
			const { previousValue, currentValue }: SimpleChange = changes['wil'];
			if (currentValue.missed_start_attempts > previousValue.missed_start_attempts) {
				this.timeSpinner.forEach((t) => t.reset());
			}
		}
	}

	ngOnInit() {
		this.userService.user$
			.pipe(
				map((user) => User.fromJSON(user)),
				takeUntil(this.destroy$)
			)
			.subscribe((user) => {
				this.user = user;
			});
		this.frameMotion$ = this.formService.getFrameMotionDirection();
		if (this.openedFromPassTile) {
			// pass has already been created, this dialog has been opened by clicking on its pass-tile from inside a
			// pass-collection
			// this.wil = this.dialogData.pass;
			this.forStaff = this.dialogData.forStaff;
		}

		this.gradient = `radial-gradient(circle at 73% 71%, ${this.wil?.color_profile.gradient_color})`;
	}

	readyToStartTick(remainingTime: number) {
		this.acceptingPassTimeRemaining = remainingTime;
		if (remainingTime === 30 || remainingTime === 29) {
			this.titleService.setTitle("⚠️ It's Time to Start your Pass");
			return;
		}

		if (remainingTime === 0) {
			this.titleService.setTitle('SmartPass');
		}

		if (remainingTime % 2 === 0) {
			this.titleService.setTitle(`⏳ ${remainingTime} sec left...`);
		} else {
			this.titleService.setTitle((document.title = `Pass Ready to Start`));
		}
	}

	showOptions(clickEvent: MouseEvent) {
		const target = new ElementRef(clickEvent.currentTarget);
		const targetElement = target.nativeElement as HTMLElement;
		const targetCoords = targetElement.getBoundingClientRect();

		const options = [{ display: 'Delete Pass', color: '#E32C66', action: WILHeaderOptions.Delete, icon: './assets/Delete (Red).svg' }];

		if (this.forStaff && !this.isKiosk) {
			options.unshift({
				display: 'Start Pass Now',
				color: '#7083A0',
				action: WILHeaderOptions.Start,
				icon: './assets/Pause (Blue-Gray).svg',
			});
		}

		const cancelDialog = this.dialog.open(ConsentMenuComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: { options: options, trigger: target },
			position: {
				top: `${targetCoords.bottom + 20}px`,
				left: `${targetCoords.left}px`,
			},
		});

		cancelDialog
			.afterClosed()
			.pipe(
				filter(Boolean),
				concatMap((action: WILHeaderOptions) => {
					if (action === WILHeaderOptions.Delete) {
						return this.wilService.deleteWilPass(this.wil.id);
					}

					if (action === WILHeaderOptions.Start) {
						return from(this.startPass());
					}

					return throwError(new Error('Invalid option chosen!'));
				}),
				finalize(() => this.closeDialog())
			)
			.subscribe();
	}

	async startPass() {
		this.requestLoading = true;
		const passRequest$ = this.hallPassService.startWilPassNow(this.wil.id).pipe(
			takeUntil(this.destroy$),
			catchError((error) => {
				if (error === HallPassErrors.Encounter) {
					this.encounterService.showEncounterPreventionToast({
						isStaff: this.forStaff,
						// @ts-ignore
						exclusionPass: this.wil,
					});
				}

				return throwError(error);
			})
		);
		let overallPassRequest$: Observable<any>;

		if (!this.forStaff && !this.isKiosk) {
			overallPassRequest$ = passRequest$;
		} else {
			overallPassRequest$ = from(this.locationsService.staffRoomLimitOverride(this.wil.destination, this.isKiosk, 1, true)).pipe(
				concatMap((overrideRoomLimit) => {
					console.log(overrideRoomLimit);
					if (!overrideRoomLimit) {
						return of(null);
					}
					return of(true);
				}),
				filter(Boolean),
				concatMap(() => passRequest$),
				takeUntil(this.destroy$)
			);
		}

		return overallPassRequest$.toPromise();
		// overallPassRequest$.pipe(finalize(() => this.closeDialog())).subscribe({
		// 	next: () => {
		// 		// pass response
		// 		this.titleService.setTitle('SmartPass');
		// 	},
		// 	error: (err) => {
		// 		console.error(err);
		// 	},
		// });
	}

	private closeDialog() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}

		if (this.firstInLinePopupRef) {
			this.firstInLinePopupRef.close();
		}

		this.titleService.setTitle('SmartPass');
		this.toggleBigBackground(false);
	}

	private toggleBigBackground(applyBackground = true) {
		if (applyBackground) {
			const solidColor = Util.convertHex(this.wil.color_profile.solid_color, 70);
			this.screen.customBackdropStyle$.next({
				background: `linear-gradient(0deg, ${solidColor} 100%, rgba(0, 0, 0, 0.3) 100%)`,
			});
			this.screen.customBackdropEvent$.next(true);
			return;
		}

		this.screen.customBackdropEvent$.next(false);
		this.screen.customBackdropStyle$.next(null);
	}

	private openBigPassCard() {
		this.toggleBigBackground();
		this.firstInLinePopup = true;
		// open this same template scaled up
		this.firstInLinePopupRef = this.dialog.open(this.templateRoot, {
			panelClass: ['overlay-dialog', 'teacher-pass-card-dialog-container'],
			backdropClass: 'custom-backdrop',
			disableClose: true,
			closeOnNavigation: true,
			data: {
				firstInLinePopup: true,
			},
		});

		if (this.dialogRef) {
			this.dialogRef.close();
		}

		this.firstInLinePopupRef.afterClosed().subscribe({
			next: () => {
				this.toggleBigBackground(false);
				this.firstInLinePopup = false;
				this.firstInLinePopupRef = null;
			},
		});
	}

	ngOnDestroy() {
		this.titleService.setTitle('SmartPass');
		this.closeDialog();
		this.destroy$.next();
		this.destroy$.complete();
	}
}
