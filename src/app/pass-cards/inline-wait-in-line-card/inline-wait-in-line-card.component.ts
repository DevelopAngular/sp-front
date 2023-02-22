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
	ViewChild,
	ViewChildren,
} from '@angular/core';
import { BehaviorSubject, from, Observable, of, Subject, throwError, timer } from 'rxjs';
import { HallPassErrors, HallPassesService } from '../../services/hall-passes.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeviceDetection } from '../../device-detection.helper';
import { WaitingInLinePass } from '../../models/WaitInLine';
import { catchError, concatMap, filter, finalize, map, takeUntil, tap } from 'rxjs/operators';
import { MatRipple } from '@angular/material/core';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
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
	@ViewChild('rootWrapper') set wrapperElem(wrapper: ElementRef<HTMLElement>) {
		if (!this.dialogData?.nextInLine) {
			return;
		}

		if (!wrapper) {
			return;
		}

		let elem = wrapper.nativeElement;
		if (!elem) {
			return;
		}

		while (!elem.classList.contains('cdk-overlay-pane')) {
			// BE CAREFUL HERE!
			elem = elem.parentElement;
		}

		elem.style.transform = `scale(${this.scalingFactor})`;
	}
	@ViewChild(MatRipple) set constantRipple(ripple: MatRipple) {
		if (!ripple) {
			return;
		}

		timer(1000, 2500)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					const rippleRef = ripple.launch({
						persistent: true,
						centered: true,
					});
					rippleRef.fadeOut();
				},
			});
	}

	gradient: string;
	requestLoading = false;
	frameMotion$: BehaviorSubject<any>;
	destroy$: Subject<any> = new Subject<any>();
	acceptingPassTimeRemaining: number;
	user: User;

	constructor(
		@Optional() private dialogRef: MatDialogRef<InlineWaitInLineCardComponent>,
		@Optional() @Inject(MAT_DIALOG_DATA) public dialogData: { nextInLine: boolean; pass: WaitingInLinePass; forStaff: boolean },
		private titleService: Title,
		private userService: UserService,
		private formService: CreateFormService,
		private locationsService: LocationsService,
		private hallPassService: HallPassesService,
		private dialog: MatDialog,
		public kioskService: KioskModeService,
		private wilService: WaitInLineService,
		private encounterService: EncounterPreventionService
	) {}

	private get scalingFactor() {
		if (!this.dialogData?.nextInLine) {
			// Ideally, this function is only ever called when a next in line dialog is triggered,
			// but the check is still placed here just in case the function is used elsewhere in
			// the component
			return 1;
		}

		if (DeviceDetection.isMobile()) {
			return 1.15;
		}
		let targetHeight = document.documentElement.clientHeight * 0.85;
		if (this.openedFromPassTile) {
			targetHeight -= 200; // make space for app-student-passes under the dialog tile
		}
		return targetHeight / 412; // 412 is defined height of this component according to the design system
	}

	get openedFromPassTile(): boolean {
		return this.forStaff || (this.isKiosk && !this.wil.isReadyToStart());
	}

	get optionsIcon() {
		return this.forStaff && !this.isKiosk ? './assets/Dots (Transparent).svg' : './assets/Delete (White).svg';
	}

	get position(): number {
		return this.wil.line_position;
	}

	get getUserName() {
		return this.wil.issuer.id == this.user.id ? 'Me' : this.wil.issuer.username;
	}

	get isKiosk() {
		return this.kioskService.isKisokMode();
	}

	get remainingAttemptSeconds(): number {
		return Math.floor((this.wil.start_attempt_end_time.getTime() - Date.now()) / 1000);
	}

	ngOnChanges(changes: SimpleChanges) {
		if (this.timeSpinner?.length > 0) {
			const { previousValue, currentValue }: SimpleChange = changes['wil'];
			if (currentValue.missed_start_attempts > previousValue.missed_start_attempts) {
				this.timeSpinner.forEach((t) => t.reset());
			}
		}
	}

	ngOnInit() {
		if (this.dialogData) {
			if (this.dialogData.pass instanceof WaitingInLinePass) {
				// it's not enough for the JSON to have the data, it must be an instance of the class
				this.wil = this.dialogData.pass;
			}
			this.forStaff = this.dialogData.forStaff;
		}

		this.userService.user$
			.pipe(
				map((user) => User.fromJSON(user)),
				takeUntil(this.destroy$)
			)
			.subscribe((user) => {
				this.user = user;
			});
		// Instead of having this.formService.getFrameMotionDirection() in multiple places all across the code,
		// this should be included inside the app-pager component and target the relevant ng-content
		// children using @ContentChildren directive: https://angular.io/api/core/ContentChildren
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

		return overallPassRequest$.pipe(finalize(() => this.closeDialog())).toPromise();
	}

	private closeDialog() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}

		this.titleService.setTitle('SmartPass');
	}

	ngOnDestroy() {
		this.titleService.setTitle('SmartPass');
		this.closeDialog();
		this.destroy$.next();
		this.destroy$.complete();
	}
}
