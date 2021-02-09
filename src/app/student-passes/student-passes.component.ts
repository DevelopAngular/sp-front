import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {User} from '../models/User';
import {interval, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {LiveDataService} from '../live-data/live-data.service';
import {HallPass} from '../models/HallPass';

import * as moment from 'moment';

@Component({
  selector: 'app-student-passes',
  templateUrl: './student-passes.component.html',
  styleUrls: ['./student-passes.component.scss']
})
export class StudentPassesComponent implements OnInit, OnDestroy {

  @Input() profile: User;
  @Input() height: number = 75;
  @Input() isResize: boolean = true;

  @Output()
  userClickResult: EventEmitter<{action: string, intervalValue: number}> = new EventEmitter<{action: string, intervalValue: number}>();

  lastStudentPasses;
  timerEvent: Subject<any> = new Subject<any>();

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    private livaDataService: LiveDataService,
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

  openProfile() {
    if (this.height === 75 && this.isResize) {
      const destroy = new Subject();
      interval(20)
        .pipe(takeUntil(destroy))
        .subscribe((res) => {
          this.userClickResult.emit({action: 'open', intervalValue: res});
          this.height += 25;
          if (this.height === 450) {
            destroy.next();
          }
        });
    }
  }

  closeProfile(event) {
    if (this.height === 450 && this.isResize) {
      event.stopPropagation();
      const destroy = new Subject();
      interval(20)
        .pipe(takeUntil(destroy))
        .subscribe((res) => {
          this.userClickResult.emit({action: 'close', intervalValue: res});
          this.height -= 25;
          if (this.height === 75) {
            destroy.next();
          }
        });
    }
  }

}
