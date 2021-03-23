import {Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {User} from '../models/User';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {LiveDataService} from '../live-data/live-data.service';
import {HallPass} from '../models/HallPass';

import * as moment from 'moment';
import {ResizeProfileImage, resizeStudentPasses, scaleStudentPasses, showHideProfileEmail, topBottomProfileName} from '../animations';
import {MatDialog} from '@angular/material/dialog';
import {PassCardComponent} from '../pass-card/pass-card.component';
import {DomCheckerService} from '../services/dom-checker.service';
import {PassLike} from '../models';

@Component({
  selector: 'app-student-passes',
  templateUrl: './student-passes.component.html',
  styleUrls: ['./student-passes.component.scss'],
  animations: [
    ResizeProfileImage,
    showHideProfileEmail,
    topBottomProfileName,
    scaleStudentPasses,
    resizeStudentPasses
  ]
})
export class StudentPassesComponent implements OnInit, OnDestroy {

  @Input() profile: User;
  @Input() height: number = 75;
  @Input() isResize: boolean = true;
  @Input() closeEvent: boolean;
  @Input() pass: PassLike;

  @Output()
  userClickResult: EventEmitter<{action: string, intervalValue: number}> = new EventEmitter<{action: string, intervalValue: number}>();
  @Output() over = new EventEmitter();

  @ViewChild('profileImage') profileImage: ElementRef;

  lastStudentPasses: Observable<HallPass[]>;
  timerEvent: Subject<any> = new Subject<any>();

  isScrollable: boolean;
  animationTrigger = {value: 'open', params: {size: '75'}};
  scaleCardTrigger$: Observable<string>;
  resizeTrigger$: Subject<'open' | 'close'> = new Subject<'open' | 'close'>();
  isOpenEvent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  destroy$: Subject<any> = new Subject<any>();

  @HostListener('document.scroll', ['$event'])
  scroll(event) {
    if (event.currentTarget.scrollTop >= 50) {
      this.isScrollable = true;
      this.animationTrigger = {value: 'close', params: {size: '42'}};
    } else {
      this.isScrollable = false;
      this.animationTrigger = {value: 'open', params: {size: '75'}};
    }
  }

  constructor(
    private livaDataService: LiveDataService,
    private dialog: MatDialog,
    private domCheckerService: DomCheckerService
  ) { }

  ngOnInit() {
    this.scaleCardTrigger$ = this.domCheckerService.scalePassCard;
    this.lastStudentPasses = this.livaDataService.expiredPasses$
      .pipe(
        map(passes => {
          return passes.filter(pass => (+pass.student.id === +this.profile.id) && (+pass.id !== +this.pass.id));
        })
      );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isActivePass(pass: HallPass) {
    return moment().isBefore(moment(pass.end_time));
  }

  get isOpen() {
    return this.isOpenEvent$.getValue() || !this.isResize;
  }

  get isClose() {
    return !this.isOpenEvent$.getValue() && this.isResize;
  }

  openProfile() {
    if (this.isClose && this.isResize) {
      this.resizeTrigger$.next('open');
      this.domCheckerService.scalePassCardTrigger$.next('resize');
      this.isOpenEvent$.next(true);
      // const destroy = new Subject();
      // interval(10)
      //   .pipe(takeUntil(destroy))
      //   .subscribe((res) => {
      //     this.userClickResult.emit({action: 'open', intervalValue: res});
      //     // this.height += 25;
      //     if (this.isOpen) {
      //       destroy.next();
      //     }
      //   });
    }
  }

  closeProfile(event) {
    if (this.isOpen && this.isResize) {
      event.stopPropagation();
      this.animationTrigger = {value: 'open', params: {size: '75'}};
      this.resizeTrigger$.next('close');
      this.isOpenEvent$.next(false);
      this.domCheckerService.scalePassCardTrigger$.next('unresize');
      // const destroy = new Subject();
      // interval(10)
      //   .pipe(takeUntil(destroy))
      //   .subscribe((res) => {
      //     this.userClickResult.emit({action: 'close', intervalValue: res});
      //     // this.height -= 25;
      //     if (this.isClose) {
      //       destroy.next();
      //     }
      //   });
    }
  }

  openPass({pass}) {
    this.domCheckerService.scalePassCardTrigger$.next('open');
    const expiredPass = this.dialog.open(PassCardComponent, {
      panelClass: 'teacher-pass-card-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {pass, forStaff: true, showStudentInfoBlock: !this.isResize, passForStudentsComponent: this.isResize}
    });

    expiredPass.afterClosed().subscribe(() => {
      this.domCheckerService.scalePassCardTrigger$.next('close');
    });
  }

}
