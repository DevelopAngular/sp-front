import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core'
import { RecurringConfig } from '../../models/RecurringFutureConfig'
import { interval, merge, Observable, of, Subject, timer } from 'rxjs'
import { User } from '../../models/User'
import { Navigation } from '../../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component'
import { Pinnable } from '../../models/Pinnable'
import { HttpService } from '../../services/http-service'
import { DataService } from '../../services/data-service'
import { HallPassesService } from '../../services/hall-passes.service'
import { TimeService } from '../../services/time.service'
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service'
import { MatDialog } from '@angular/material/dialog'
import { ScreenService } from '../../services/screen.service'
import { StorageService } from '../../services/storage.service'
import { DeviceDetection } from '../../device-detection.helper'
import { ordinance, WaitInLine } from '../../models/WaitInLine'
import { WaitInLineService } from '../../services/wait-in-line.service'
import { take, takeUntil, tap } from 'rxjs/operators'

export enum WaitInLineState {
  CreatingPass,
  WaitingInLine,
  FrontOfLine,
  PassStarted,
  RequestWaiting
}

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
  @Input() isOpenBigPass: boolean;
  @Input() fullScreen: boolean;

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

  get gradient() {
    return 'radial-gradient(circle at 73% 71%, ' + this.wil.color_profile.gradient_color + ')';
  }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  get wilDisabled() {
    return this.waitInLineState === WaitInLineState.RequestWaiting || this.waitInLineState === WaitInLineState.WaitingInLine;
  }

  ngOnInit() {

    timer(0, 2000).pipe(
      take(3)
    ).subscribe({
      next: counter => {
        this.wilService.fakeWil.next(WaitInLine.fromJSON({...this.wil, position: 3 - counter}));
      }
    })

    // counter = setInterval(() => {
    //
    //   this.wilService.fakeWil.next({
    //     ...this wil,
    //     position: ordinance(count)
    //   });
    // }, 1000);

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
      this.openBigPassCard();
    }
  }

  ngOnDestroy() {
    this.subscribers$.unsubscribe();
    this.closeDialog();
    this.destroy$.next();
    this.destroy$.complete();
  }

  roomCodeResult(event){
    console.log("event : ", event);

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

  back(){
    if (this.activeTeacherPin == true) {
      this.activeTeacherPin = false;
      this.activeRoomCodePin = false;
      this.activeTeacherSelection = true;
    }else if(this.activeTeacherSelection == true) {
      this.activeRoomCodePin = true;
      this.activeTeacherPin = false;
      this.activeTeacherSelection = false;
    }else {
      this.activeRoomCodePin = false;
      this.activeTeacherPin = false;
      this.activeTeacherSelection = false;
    }
  }

  closeDialog() {
    this.screen.closeDialog();
  }

  openBigPassCard() {
    console.log('open big card');
    // this.storage.setItem('pass_full_screen', !this.isOpenBigPass);
    // this.screen.openBigPassCard(false, this.wil, 'inlinewil');
  }
}
