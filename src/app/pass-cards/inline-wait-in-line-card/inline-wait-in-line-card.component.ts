import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit, Optional, QueryList,
  SimpleChanges, TemplateRef,
  ViewChild, ViewChildren
} from '@angular/core'
import { Subject, timer } from 'rxjs'
import { User } from '../../models/User'
import { Navigation } from '../../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component'
import { Pinnable } from '../../models/Pinnable'
import { HttpService } from '../../services/http-service'
import { DataService } from '../../services/data-service'
import { HallPassesService } from '../../services/hall-passes.service'
import { TimeService } from '../../services/time.service'
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { ScreenService } from '../../services/screen.service'
import { StorageService } from '../../services/storage.service'
import { DeviceDetection } from '../../device-detection.helper'
import { WaitInLine } from '../../models/WaitInLine'
import { WaitInLineService } from '../../services/wait-in-line.service'
import { take, takeUntil, tap } from 'rxjs/operators'
import { MatRipple } from '@angular/material/core'
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component'
import { Util } from '../../../Util'

export enum WaitInLineState {
  CreatingPass,
  WaitingInLine,
  FrontOfLine,
  PassStarted,
  RequestWaiting
}

export enum WILHeaderOptions {
  Delete = 'delete',
  Start = 'start'
}

// TODO: Start Pass Logic
@Component({
  selector: 'app-inline-wait-in-line-card',
  templateUrl: './inline-wait-in-line-card.component.html',
  styleUrls: ['./inline-wait-in-line-card.component.scss']
})
export class InlineWaitInLineCardComponent implements OnInit, OnDestroy, OnChanges {

  @Input() wil: WaitInLine;
  @Input() isActive: boolean = false;
  @Input() forInput: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;
  @Input() fullScreen: boolean;
  @Input() forStaff: boolean;

  @ViewChild('root') root: TemplateRef<any>;
  @ViewChild('rootWrapper') wrapperElem: ElementRef<HTMLDivElement>;
  @ViewChildren(MatRipple) set constantRipple(ripples: QueryList<MatRipple>) {
    if (!ripples?.length) {
      return;
    }

    console.log(ripples);

    timer(0, 2500)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          ripples.forEach(r => {
            const rippleRef = r.launch({
              persistent: true,
              centered: true
            });
            rippleRef.fadeOut();
          })

        }
      })
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
  timeLeft: string = '';
  valid: boolean = true;
  overlayWidth: string = '0px';
  buttonWidth: number = 288;
  isExpiring: boolean;

  selectedDuration: number;
  selectedTravelType: string;
  subscribers$;
  activeRoomCodePin: boolean;
  activeTeacherPin: boolean;
  activeTeacherSelection: boolean;
  selectedTeacher: User;
  destroy$: Subject<any> = new Subject<any>();
  waitInLineState: WaitInLineState = WaitInLineState.WaitingInLine;
  acceptingPassTimeRemaining: number;
  passAttempts = 2; // TODO: when this hits 0, then kick the student to the back of the line
  firstInLinePopup = false;

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
    private wilService: WaitInLineService
  ) { }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  get wilDisabled() {
    return this.waitInLineState === WaitInLineState.RequestWaiting || this.waitInLineState === WaitInLineState.WaitingInLine;
  }

  ngOnInit() {
    this.gradient = `radial-gradient(circle at 73% 71%, ${this.wil.color_profile.gradient_color})`;
    // TODO: Remove mock code when APIs are available
    timer(0, 2000).pipe(
      take(3)
    ).subscribe({
      next: counter => {
        this.wilService.fakeWil.next(WaitInLine.fromJSON({...this.wil, position: 3 - counter}));
      }
    })

    // this.endPassLoading$ = this.hallPassService.startPassLoading$;
    // if (JSON.parse(this.storage.getItem('pass_full_screen')) && !this.fullScreen) {
    //   setTimeout(() => {
    //     this.openBigPassCard();
    //   }, 10);
    // }
    // this.subscribers$ = merge(of(0), interval(1000)).pipe(map(x => {
    //   if (!!this.pass && this.isActive) {
    //     const end: Date = this.wil.expiration_time;
    //     const now: Date = this.timeService.nowDate();
    //     const diff: number = (end.getTime() - now.getTime()) / 1000;
    //     const mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
    //     const secs: number = Math.abs(Math.floor(diff) % 60);
    //     this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
    //     this.valid = end > now;
    //
    //     const start: Date = this.wil.start_time;
    //     const dur: number = Math.floor((end.getTime() - start.getTime()) / 1000);
    //     this.overlayWidth = (this.buttonWidth * (diff / dur)) + 'px';
    //     this.isExpiring = Date.now() > this.wil.expiration_time.getTime();
    //     return x;
    //   }
    // })).subscribe(() => {
    //   this.cdr.detectChanges();
    // });

    // this.shortcutsService.onPressKeyEvent$
    //   .pipe(
    //     filter(() => !this.isMobile),
    //     pluck('key')
    //   )
    //   .subscribe(key => {
    //     if (key[0] === 'e') {
    //       this.endPass();
    //     }
    //   });

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
          from: null
        },
        roomStudents: null,
      },
      forInput: false,
      forLater: false,
      kioskMode: false
    };

    this.pinnable = this.FORM_STATE.data.direction ? this.FORM_STATE.data.direction.pinnable : null;
  }

  ngOnChanges (changes: SimpleChanges) {
    const { wil } = changes;
    if (wil.currentValue?.position === '1st') {
      this.waitInLineState = WaitInLineState.FrontOfLine;
      this.firstInLinePopup = true;
      this.openBigPassCard();
    }
  }

  ngOnDestroy() {
    // this.subscribers$.unsubscribe();
    this.closeDialog();
    this.destroy$.next();
    this.destroy$.complete();
  }

  roomCodeResult(event){
    console.log("event : ", event);

  }

  get optionsIcon() {
    return this.forStaff
      ? './assets/Dots (Transparent).svg'
      : './assets/Delete (White).svg';
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
        // TODO: Close dialog before deleting pass if dialog is open
        if (action === WILHeaderOptions.Delete) {
          this.wilService.fakeWilActive.next(false);
          this.wilService.fakeWil.next(null);
        }
      }
    });
  }

  enableTeacherPin(){
    this.activeRoomCodePin = false;
    this.activeTeacherPin = true;
    this.activeTeacherSelection = false;
  }

  selectTeacher(){
    this.activeRoomCodePin = false;
    this.activeTeacherPin = false;
    this.activeTeacherSelection = true;
  }

  requestTarget(teacher) {
    this.enableTeacherPin();
    this.selectedTeacher = teacher;
  }

  closeDialog() {
    // this.screen.closeDialog();
  }

  openBigPassCard() {
    console.log('open big card');
    console.log(this.wil.color_profile);
    const solidColor = Util.convertHex(this.wil.color_profile.solid_color, 70);
    console.log(solidColor);
    this.screen.customBackdropStyle$.next({
      'background': `linear-gradient(0deg, ${solidColor} 100%, rgba(0, 0, 0, 0.3) 100%)`,
    });
    this.screen.customBackdropEvent$.next(true);

    let scalingFactor: number;
    const translationDistance = this.isMobile
      ? `-65px`
      : `-60px`;
    if (this.isMobile) {
      scalingFactor = 1.15;
    } else {
      const targetHeight = document.documentElement.clientHeight * 0.85;
      scalingFactor = targetHeight / 412; // 412 is defined height of this component according to the design system
    }

    // open this same template scaled up
    const openedWILCardRef = this.dialog.open(this.root, {
      panelClass: 'overlay-dialog',
      data: {
        firstInLinePopup: true
      }
    });

    openedWILCardRef.afterOpened().subscribe({
      next: () => {
        const wrapperDiv = document.querySelector<HTMLDivElement>('mat-dialog-container.mat-dialog-container').parentElement;
        wrapperDiv.style.transform = `scale(${scalingFactor})`;
        // console.log(wrapperDiv);
        // const translationDistance = this.isMobile
        //   ? `-65px`
        //   : `-60px`;
        //
        // if (this.isMobile) {
        //   wrapperDiv.style.transform = `scale(1.15) translateY(${translationDistance})`;
        //   return;
        // }
        // we want the pass limit and bottom banners to be 90% of the
        // screen height
        // const {height} = wrapperDiv.getBoundingClientRect();
        // const targetHeight = document.documentElement.clientHeight * 0.85;
        // const scalingFactor = targetHeight / height;
        // translate happens before the scaling
        // wrapperDiv.style.transform = `translateY(${translationDistance}) scale(${scalingFactor})`;
        // console.log(scalingFactor);
        // console.log(wrapperDiv);
      }
    })
    openedWILCardRef.afterClosed().subscribe({
    next: () => {
      this.screen.customBackdropEvent$.next(false);
      this.screen.customBackdropStyle$.next(null);
    }
  });


  }
}
