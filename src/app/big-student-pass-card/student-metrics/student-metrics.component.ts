import {Component, OnInit} from '@angular/core';
import {filter, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {User} from '../../models/User';
import {HallPassesService} from '../../services/hall-passes.service';
import {UserService} from '../../services/user.service';
import {QuickPreviewPasses} from '../../models/QuickPreviewPasses';

@Component({
  selector: 'app-student-metrics',
  templateUrl: './student-metrics.component.html',
  styleUrls: ['./student-metrics.component.scss']
})
export class StudentMetricsComponent implements OnInit {

  user$: Observable<User>;
  loading$: Observable<boolean>;
  passStats$: Observable<QuickPreviewPasses>;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    private passesService: HallPassesService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.user$ = this.userService.user$.pipe(filter(user => !!user));
    this.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.passesService.getQuickPreviewPassesRequest(user.id);
    });
    this.loading$ = this.passesService.quickPreviewPassesLoading$;
    this.passStats$ = this.passesService.quickPreviewPassesStats$;
  }

}
