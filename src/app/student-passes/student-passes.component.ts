import {Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {User} from '../models/User';
import {interval, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {LiveDataService} from '../live-data/live-data.service';
import {HallPass} from '../models/HallPass';

import * as moment from 'moment';
import {ResizeProfileImage, showHideProfileEmail, topBottomProfileName} from '../animations';
import {MatDialog} from '@angular/material/dialog';
import {PassCardComponent} from '../pass-card/pass-card.component';

@Component({
  selector: 'app-student-passes',
  templateUrl: './student-passes.component.html',
  styleUrls: ['./student-passes.component.scss'],
  animations: [ResizeProfileImage, showHideProfileEmail, topBottomProfileName]
})
export class StudentPassesComponent implements OnInit, OnDestroy {

  @Input() profile: User;
  @Input() height: number = 75;
  @Input() isResize: boolean = true;
  @Input() closeEvent: boolean;

  @Output()
  userClickResult: EventEmitter<{action: string, intervalValue: number}> = new EventEmitter<{action: string, intervalValue: number}>();
  @Output() over = new EventEmitter();

  @ViewChild('profileImage') profileImage: ElementRef;

  lastStudentPasses: Observable<HallPass[]>;
  timerEvent: Subject<any> = new Subject<any>();

  scrollPosition: number;
  animationTrigger = {value: 'open', params: {size: '75'}};

  destroy$: Subject<any> = new Subject<any>();

  @HostListener('document.scroll', ['$event'])
  scroll(event) {
    if (event.currentTarget.scrollTop >= 50) {
      this.animationTrigger = {value: 'close', params: {size: '42'}};
    } else {
      this.animationTrigger = {value: 'open', params: {size: '75'}};
    }
    this.scrollPosition = event.currentTarget.scrollTop;
  }

  constructor(
    private livaDataService: LiveDataService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.lastStudentPasses = this.livaDataService.expiredPasses$
      .pipe(
        map(passes => passes.filter(pass => +pass.student.id === +this.profile.id))
      );

    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.timerEvent.next(null);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isActivePass(pass: HallPass) {
    return moment().isBefore(moment(pass.end_time));
  }

  get isOpen() {
    return this.height === 475 || !this.isResize;
  }

  get isClose() {
    return this.height === 75;
  }

  openProfile() {
    if (this.isClose && this.isResize) {
      const destroy = new Subject();
      interval(15)
        .pipe(takeUntil(destroy))
        .subscribe((res) => {
          this.userClickResult.emit({action: 'open', intervalValue: res});
          this.height += 25;
          if (this.isOpen) {
            destroy.next();
          }
        });
    }
  }

  closeProfile(event) {
    if (this.isOpen && this.isResize) {
      event.stopPropagation();
      const destroy = new Subject();
      interval(15)
        .pipe(takeUntil(destroy))
        .subscribe((res) => {
          this.userClickResult.emit({action: 'close', intervalValue: res});
          this.height -= 25;
          if (this.isClose) {
            destroy.next();
          }
        });
    }
  }

  openPass({pass}) {
    const expiredPass = this.dialog.open(PassCardComponent, {
      panelClass: 'teacher-pass-card-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {pass, forStaff: true, showStudentInfoBlock: false, passForStudentsComponent: true}
    });
  }

}
