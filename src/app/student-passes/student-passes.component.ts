import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {User} from '../models/User';
import {interval, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LiveDataService} from '../live-data/live-data.service';
import {HallPass} from '../models/HallPass';

import * as moment from 'moment';

// export class StudentPastPassProvider implements PassLikeProvider {
//   constructor(private liveDataService: LiveDataService, private user$: Observable<User>) {
//   }
//
//   watch(sort: Observable<string>) {
//     const sortReplay = new ReplaySubject<string>(1);
//     sort.subscribe(sortReplay);
//
//     return this.user$
//       .pipe(
//         switchMap(user => {
//           return combineLatest(
//             this.liveDataService.watchActiveHallPasses(empty(), {type: 'student', value: user}, null, 4),
//             this.liveDataService.watchPastHallPasses({type: 'student', value: user}, 4)
//           ).pipe(
//             map(([active, past]) => {
//               return [...active, ...past].slice(0, 4);
//             })
//           );
//           }
//         )
//       );
//   }
// }

@Component({
  selector: 'app-student-passes',
  templateUrl: './student-passes.component.html',
  styleUrls: ['./student-passes.component.scss']
})
export class StudentPassesComponent implements OnInit, OnDestroy {

  @Input() profile: User;

  @Output()
  userClickResult: EventEmitter<{action: string, intervalValue: number}> = new EventEmitter<{action: string, intervalValue: number}>();

  height: number = 75;
  lastStudentPasses;
  timerEvent: Subject<any> = new Subject<any>();

  destroy$: Subject<any> = new Subject<any>();

  constructor(private livaDataService: LiveDataService) { }

  ngOnInit() {
    // this.lastStudentPasses =
    //   new StudentPastPassProvider(this.livaDataService, of(this.profile)).watch(of('')).pipe(shareReplay(1));

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
    if (this.height === 75) {
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
    if (this.height === 450) {
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
