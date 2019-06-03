import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { merge, of, combineLatest ,  BehaviorSubject ,  Observable } from 'rxjs';
import { DataService } from '../services/data-service';
import { mergeObject } from '../live-data/helpers';
import { LiveDataService } from '../live-data/live-data.service';
import { LoadingService } from '../services/loading.service';
import { PassLikeProvider, WrappedProvider } from '../models/providers';
import { User } from '../models/User';
import { ReportFormComponent } from '../report-form/report-form.component';
import {Report} from '../models/Report';
import { delay, filter, map } from 'rxjs/operators';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {UserService} from '../services/user.service';
import {RepresentedUser} from '../navbar/navbar.component';

function isUserStaff(user: User): boolean {
  return user.roles.includes('_profile_teacher');
}

export class ActivePassProvider implements PassLikeProvider {

  constructor(private liveDataService: LiveDataService, private searchQueries: Observable<string>) {
  }

  watch(sort: Observable<string>) {

    const sort$ = sort.pipe(map(s => ({sort: s})));
    const search$ = this.searchQueries.pipe(map(s => ({search_query: s})));

    const merged$ = mergeObject({sort: '-created', search_query: ''}, merge(sort$, search$));

    return this.liveDataService.watchActiveHallPasses(merged$);
  }
}

@Component({
  selector: 'app-hall-monitor',
  templateUrl: './hall-monitor.component.html',
  styleUrls: ['./hall-monitor.component.scss']
})
export class HallMonitorComponent implements OnInit {

  activePassProvider: WrappedProvider;

  inputValue = '';

  user: User;
  effectiveUser: RepresentedUser;
  isStaff = false;
  canView = false;
  sendReports: Report[] = [];
  isActiveMessage: boolean;

  searchQuery$ = new BehaviorSubject('');
  passesLoaded: Observable<boolean> = of(false);

  hasPasses: Observable<boolean> = of(false);
  isReportFormOpened: boolean;
  reportFormInstance: ReportFormComponent;

  constructor(
    public dataService: DataService,
    public userService: UserService,
    private _zone: NgZone,
    private loadingService: LoadingService,
    public dialog: MatDialog,
    private liveDataService: LiveDataService,
    public darkTheme: DarkThemeSwitch
  ) {
    this.activePassProvider = new WrappedProvider(new ActivePassProvider(this.liveDataService, this.searchQuery$));
    // this.activePassProvider = new BasicPassLikeProvider(testPasses);
  }

  get isStaff$(): Observable<boolean> {
    return this.dataService.currentUser.pipe(map(isUserStaff));
  }

  ngOnInit() {

    combineLatest(
      this.dataService.currentUser,
      this.userService.effectiveUser,
      (cu: User, eu: RepresentedUser) => {
        return {cu, eu};
      }
    )
    .pipe(this.loadingService.watchFirst)
    .subscribe((v) => {
      this._zone.run(() => {

        this.user = v.cu;
        this.effectiveUser = v.eu;
        this.isStaff = v.cu.roles.includes('_profile_teacher');

        if (this.effectiveUser) {
          this.canView = this.effectiveUser.roles.includes('access_hall_monitor') && this.effectiveUser.roles.includes('view_traveling_users');
        } else {
          this.canView = this.user.roles.includes('access_hall_monitor') && this.user.roles.includes('view_traveling_users');
        }
      });
    })


    this.hasPasses = combineLatest(
        this.activePassProvider.length$,
        (l1) => l1 > 0
      );

      this.passesLoaded = combineLatest(
        this.activePassProvider.loaded$,
        (l1) => l1
      );

      this.dialog.afterOpened.subscribe( () => {
        this.isReportFormOpened = true;
      });

      this.dialog.afterAllClosed.subscribe( () => {
        this.isReportFormOpened = false;
      });
  }

  openReportForm() {

    const dialogRef = this.dialog.open(ReportFormComponent, {
      panelClass: ['form-dialog-container', 'report-dialog'],
      backdropClass: 'custom-backdrop',
    });

    dialogRef.afterClosed().pipe(filter(res => !!res), map(res => {
        this.sendReports = res;
        this.isActiveMessage = true;
        return res;
    }), delay(3000)).subscribe(() => {
      this.isActiveMessage = false;
    });

    this.reportFormInstance = dialogRef.componentInstance;
  }

  onReportFromPassCard(studends) {
    if (studends) {
      this.sendReports = studends;
      this.isActiveMessage = true;
      setTimeout(() => {
        this.isActiveMessage = false;
      }, 3000);
    } else {
      return;
    }
  }

  onSearch(search: string) {
    this.inputValue = search;
    this.searchQuery$.next(search);
  }

  back() {
    this.reportFormInstance.back();
  }
}
