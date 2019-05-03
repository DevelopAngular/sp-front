import {Component, HostListener, NgZone, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material';
import {merge, of, combineLatest, BehaviorSubject, Observable, Subject} from 'rxjs';
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
import {ScreenService} from '../services/screen.service';
import {RepresentedUser} from '../navbar/navbar.component';
import {ButtonRestriction} from '../models/button-restrictions/ButtonRestriction';
import {ReportButtonRestriction} from '../models/button-restrictions/ReportButtonRestriction';
import {SortBtnRestriction} from '../models/button-restrictions/SortBtnRestriction';
import {InputRestriction} from '../models/input-restrictions/InputRestriction';
import {InputResctrictionXl} from '../models/input-restrictions/InputResctrictionXl';
import {InputRestriciontSm} from '../models/input-restrictions/InputRestriciontSm';
import {CollectionRestriction} from '../models/collection-restrictions/CollectionRestriction';
import {HallMonitorCollectionRestriction} from '../models/collection-restrictions/HallMonitorCollectionRestriction';
import {SortMenuComponent} from '../sort-menu/sort-menu.component';

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

  isDeviceLargeExtra: boolean;

  isSearchClicked: boolean;

  resetvalue = new Subject();

  isIpadWidth: boolean;

  isIpadSearchBar: boolean;

  reportBtn: ButtonRestriction = new ReportButtonRestriction();

  sortBtn: ButtonRestriction = new SortBtnRestriction();

  inputRestrictionXl: InputRestriction = new InputResctrictionXl();

  inputRestrictionSm: InputRestriction = new InputRestriciontSm();

  hallMonitorCollection: CollectionRestriction = new HallMonitorCollectionRestriction();

  constructor(
    public dataService: DataService,
    private _zone: NgZone,
    private loadingService: LoadingService,
    public dialog: MatDialog,
    private liveDataService: LiveDataService,
    public darkTheme: DarkThemeSwitch,
    private screenService: ScreenService,
  ) {
    this.activePassProvider = new WrappedProvider(new ActivePassProvider(this.liveDataService, this.searchQuery$));
    // this.activePassProvider = new BasicPassLikeProvider(testPasses);
  }

  get isStaff$(): Observable<boolean> {
    return this.dataService.currentUser.pipe(map(isUserStaff));
  }

  ngOnInit() {
    this.isIpadWidth = this.screenService.isIpadWidth;
    this.isDeviceLargeExtra = this.screenService.isDeviceLargeExtra;
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.hallMonitorCollection.forStaff = user.roles.includes('_profile_teacher');
          this.canView = user.roles.includes('view_traveling_users');
        });
      });

    this.hasPasses = combineLatest(
        this.activePassProvider.length$,
        (l1) => l1 > 0
      );

      this.passesLoaded = combineLatest(
        this.activePassProvider.loaded$,
        (l1) => l1
      );
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
  }

  openSortMenu() {
    setTimeout( () => {
      const dialogRef = this.dialog.open(SortMenuComponent, {
        position: { bottom: '1px' },
        panelClass: 'sort-dialog'
      });
    } , 100);

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

  @HostListener('window:resize')
  checkDeviceWidth() {
    this.isIpadWidth = this.screenService.isIpadWidth;
    this.isDeviceLargeExtra = this.screenService.isDeviceLargeExtra;
    if (this.screenService.isDeviceMid) {
      this.isIpadSearchBar = false;
    }
  }

  toggleSearchBar() {
    this.isSearchClicked = !this.isSearchClicked;
    if (this.screenService.isIpadWidth) {
      this.isIpadSearchBar = !this.isIpadSearchBar;
    }
  }

  cleanSearchValue() {
    this.resetvalue.next('');
  }

}
