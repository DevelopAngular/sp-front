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
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core'
import { from, of, Subject, timer } from 'rxjs'
import { Navigation } from '../../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component'
import { Pinnable } from '../../models/Pinnable'
import { HttpService } from '../../services/http-service'
import { DataService } from '../../services/data-service'
import { HallPassesService } from '../../services/hall-passes.service'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'
import { ScreenService } from '../../services/screen.service'
import { DeviceDetection } from '../../device-detection.helper'
import { WaitInLine } from '../../models/WaitInLine'
import { WaitInLineService, WaitInLineState } from '../../services/wait-in-line.service'
import { concatMap, filter, take, takeUntil, takeWhile, tap } from 'rxjs/operators'
import { MatRipple } from '@angular/material/core'
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component'
import { Util } from '../../../Util'
import { KioskModeService } from '../../services/kiosk-mode.service'
import { LocationsService } from '../../services/locations.service'

export enum WILHeaderOptions {
  Delete = 'delete',
  Start = 'start'
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
  styleUrls: ['./inline-wait-in-line-card.component.scss']
})
export class InlineWaitInLineCardComponent implements OnInit, OnDestroy, OnChanges {

  @Input() wil: WaitInLine;
  @Input() forStaff: boolean;

  @ViewChild('root') root: TemplateRef<any>;
  @ViewChildren('rootWrapper') set wrapperElem(wrappers: QueryList<ElementRef<HTMLDivElement>>) {
    if (!wrappers) {
      return
    }

    if (this.showBigCard) {
      wrappers.last.nativeElement.parentElement.parentElement.parentElement.style.transform = `scale(${this.scalingFactor})`;
      return;
    }

    if (!this.firstInLinePopup) {
      return
    }

    wrappers.last.nativeElement.parentElement.parentElement.style.transform = `scale(${this.scalingFactor})`;
  }
  @ViewChildren(MatRipple) set constantRipple(ripples: QueryList<MatRipple>) {
    if (!ripples?.length) {
      return;
    }

    timer(1000, 2500).pipe(
      takeWhile(() => ripples?.length > 0),
      takeUntil(this.destroy$)
    ).subscribe(() => {
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
        centered: true
      });
      rippleRef.fadeOut();
    });
  }

  @ViewChild('waitingDots') set dotsSpan(span: ElementRef<HTMLSpanElement>) {
    if (!span) {
      return;
    }

    timer(0, 750).pipe(
      takeUntil(this.destroy$),
      tap(count => {
        span.nativeElement.innerText = '.'.repeat(count % 4);
        count++;
      })
    ).subscribe();
  }

  gradient: string;
  valid: boolean = true;
  overlayWidth: string = '0px';
  buttonWidth: number = 288;
  isMobile = DeviceDetection.isMobile();

  destroy$: Subject<any> = new Subject<any>();
  waitInLineState: WaitInLineState = WaitInLineState.WaitingInLine;
  acceptingPassTimeRemaining: number;
  passAttempts = 2;
  firstInLinePopup = false;
  firstInLinePopupRef: MatDialogRef<TemplateRef<any>>;

  public FORM_STATE: Navigation;
  pinnable: Pinnable;

  constructor(
    @Optional() private dialogRef: MatDialogRef<InlineWaitInLineCardComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: { pass: WaitInLine, forStaff: boolean },
    private http: HttpService,
    private dataService: DataService,
    private locationsService: LocationsService,
    private hallPassService: HallPassesService,
    private dialog: MatDialog,
    private screen: ScreenService,
    private wilService: WaitInLineService,
    private kioskService: KioskModeService
  ) { }

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
    return this.forStaff
      ? './assets/Dots (Transparent).svg'
      : './assets/Delete (White).svg';
  }

  get showBigCard() {
    return this.waitInLineState === WaitInLineState.FrontOfLine || this.openedFromPassTile;
  }

  ngOnChanges (changes: SimpleChanges) {
    const { wil } = changes;
    if (wil.currentValue?.position === '1st') {
      this.waitInLineState = WaitInLineState.FrontOfLine;
      this.openBigPassCard();
    }
  }

  ngOnInit() {
    if (this.openedFromPassTile) {
      // pass has already been created, this dialog has been opened by clicking on its pass-tile from inside a
      // pass-collection
      this.waitInLineState = WaitInLineState.WaitingInLine;
      this.wil = this.dialogData.pass;
      this.forStaff = this.dialogData.forStaff
    }

    this.gradient = `radial-gradient(circle at 73% 71%, ${this.wil.color_profile.gradient_color})`;

    if (!this.openedFromPassTile) {
      // TODO: Remove mock code when APIs are available
      timer(0, 2000).pipe(
        take(3)
      ).subscribe({
        next: counter => {
          this.wilService.fakeWil.next(WaitInLine.fromJSON({...this.wil, position: 3 - counter}));
        }
      })
    }
  }

  showOptions(clickEvent: MouseEvent) {
    const target = new ElementRef(clickEvent.currentTarget);
    const targetElement = target.nativeElement as HTMLElement;
    const targetCoords = targetElement.getBoundingClientRect();

    const options = [
      { display: 'Delete Pass', color: '#E32C66', action: WILHeaderOptions.Delete, icon: './assets/Delete (Red).svg' }
    ];

    if (this.forStaff) {
      options.unshift({
        display: 'Start Pass Now', color: '#7083A0', action: WILHeaderOptions.Start, icon: './assets/Pause (Blue-Gray).svg'
      })
    }

    const cancelDialog = this.dialog.open(ConsentMenuComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {options: options, 'trigger': target},
      position: {
        top: `${targetCoords.bottom + 20}px`,
        left: `${targetCoords.left}px`
      }
    });

    cancelDialog.afterClosed().subscribe({
      next: action => {
        if (action === WILHeaderOptions.Delete) {
          this.closeDialog(true);
          return;
        }

        if (action === WILHeaderOptions.Start) {
          this.startPass();
          return;
        }
      }
    });
  }

  startPass() {
    this.waitInLineState = WaitInLineState.CreatingPass;
    const newPassRequestBody = {
      duration: this.wil.duration,
      origin: this.wil.origin.id,
      destination: this.wil.destination.id,
      travel_type: this.wil.travel_type,
      student: this.wil.student.id
    };

    if (this.kioskService.isKisokMode()) {
      newPassRequestBody['self_issued'] = true;
    }

    from(this.locationsService.staffRoomLimitOverride(this.wil.destination, this.kioskService.isKisokMode(), 1, true)).pipe(
      concatMap(overrideRoomLimit => {
        if (!overrideRoomLimit) {
          this.waitInLineState = this.wil.position === '1st' ? WaitInLineState.FrontOfLine : WaitInLineState.WaitingInLine;
          return of(null);
        }

        return of(newPassRequestBody)
      }),
      filter(Boolean),
      concatMap(requestBody => this.hallPassService.createPass(requestBody)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => { // pass response
        this.waitInLineState = WaitInLineState.PassStarted;
        this.closeDialog(true);
      },
      error: (err) => {
        console.error(err);
        this.waitInLineState = WaitInLineState.FrontOfLine;
      }
    })
  }

  private closeDialog(deleteWil: boolean = true) {
    if (this.dialogRef) {
      this.dialogRef.close()
    } else if (this.firstInLinePopupRef) {
      this.firstInLinePopupRef.close();
    }

    if (deleteWil) {
      this.deleteWil();
    }
  }

  private deleteWil() {
    this.wilService.fakeWilActive.next(false);
    this.forStaff
      ? this.wilService.fakeWilPasses.next([])
      : this.wilService.fakeWil.next(null)
  }

  private openBigPassCard() {
    const solidColor = Util.convertHex(this.wil.color_profile.solid_color, 70);
    this.screen.customBackdropStyle$.next({
      'background': `linear-gradient(0deg, ${solidColor} 100%, rgba(0, 0, 0, 0.3) 100%)`,
    });
    this.screen.customBackdropEvent$.next(true);

    this.firstInLinePopup = true;
    // open this same template scaled up
    this.firstInLinePopupRef = this.dialog.open(this.root, {
      panelClass: 'overlay-dialog',
      disableClose: true,
      closeOnNavigation: true,
      data: {
        firstInLinePopup: true
      }
    });

    this.firstInLinePopupRef.afterClosed().subscribe({
      next: () => {
        this.screen.customBackdropEvent$.next(false);
        this.screen.customBackdropStyle$.next(null);
        this.firstInLinePopup = false;
        this.firstInLinePopupRef = null;
      }
    });
  }

  resetAttempt() {
    if (this.passAttempts === 1) {
      this.waitInLineState = WaitInLineState.WaitingInLine;
      this.closeDialog(false);
      return;
    }

    if (this.passAttempts === 2) {
      this.closeDialog(true);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
