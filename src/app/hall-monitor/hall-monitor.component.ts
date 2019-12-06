import {ChangeDetectionStrategy, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material';
import {merge, of, combineLatest, BehaviorSubject, Observable, Subject, interval} from 'rxjs';
import { DataService } from '../services/data-service';
import { mergeObject } from '../live-data/helpers';
import { LiveDataService } from '../live-data/live-data.service';
import { LoadingService } from '../services/loading.service';
import { PassLikeProvider, WrappedProvider } from '../models/providers';
import { User } from '../models/User';
import { ReportFormComponent } from '../report-form/report-form.component';
import {Report} from '../models/Report';
import {delay, filter, map, takeUntil, tap} from 'rxjs/operators';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {UserService} from '../services/user.service';
import {ScreenService} from '../services/screen.service';
import {RepresentedUser} from '../navbar/navbar.component';
import {SortMenuComponent} from '../sort-menu/sort-menu.component';
import {ButtonRestriction} from '../models/button-restrictions/ButtonRestriction';
import {ReportButtonRestriction} from '../models/button-restrictions/ReportButtonRestriction';
import {SortBtnRestriction} from '../models/button-restrictions/SortBtnRestriction';
import {InputRestriction} from '../models/input-restrictions/InputRestriction';
import {InputResctrictionXl} from '../models/input-restrictions/InputResctrictionXl';
import {InputRestriciontSm} from '../models/input-restrictions/InputRestriciontSm';
import {CollectionRestriction} from '../models/collection-restrictions/CollectionRestriction';
import {HallMonitorCollectionRestriction} from '../models/collection-restrictions/HallMonitorCollectionRestriction';
import {ScrollPositionService} from '../scroll-position.service';
import {DeviceDetection} from '../device-detection.helper';

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
  styleUrls: ['./hall-monitor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HallMonitorComponent implements OnInit, OnDestroy {

  private scrollableAreaName = 'HallMonitorTeacher';
  private scrollableArea: HTMLElement;

  @ViewChild('scrollableArea') set scrollable(scrollable: ElementRef) {
    if (scrollable) {
      this.scrollableArea = scrollable.nativeElement;

      const updatePosition = function () {

        const scrollObserver = new Subject();
        const initialHeight = this.scrollableArea.scrollHeight;
        const scrollOffset = this.scrollPosition.getComponentScroll(this.scrollableAreaName);

        /**
         * If the scrollable area has static height, call `scrollTo` immediately,
         * otherwise additional subscription will perform once if the height changes
         */

        if (scrollOffset) {
          this.scrollableArea.scrollTo({top: scrollOffset});
        }

        interval(50)
          .pipe(
            filter(() => {
              return initialHeight < ((scrollable.nativeElement as HTMLElement).scrollHeight) && scrollOffset;
            }),
            takeUntil(scrollObserver)
          )
          .subscribe((v) => {
            console.log(scrollOffset);
            if (v) {
              this.scrollableArea.scrollTo({top: scrollOffset});
              scrollObserver.next();
              scrollObserver.complete();
              updatePosition();
            }
          });
      }.bind(this);
      updatePosition();
    }
  }

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

  searchPending$: Subject<boolean> = new Subject<boolean>();

  isReportFormOpened: boolean;

  reportFormInstance: ReportFormComponent;

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

  selectedSortOption: any = {id: 1, title: 'pass expiration time', action: 'expiration_time'};

  constructor(
    private userService: UserService,
    public dataService: DataService,
    private _zone: NgZone,
    private loadingService: LoadingService,
    public dialog: MatDialog,
    private liveDataService: LiveDataService,
    public darkTheme: DarkThemeSwitch,
    public screenService: ScreenService,
    private scrollPosition: ScrollPositionService
  ) {
    this.activePassProvider = new WrappedProvider(new ActivePassProvider(this.liveDataService, this.searchQuery$));
    // this.activePassProvider = new BasicPassLikeProvider(testPasses);
  }

  get isStaff$(): Observable<boolean> {
    return this.dataService.currentUser.pipe(map(isUserStaff));
  }

  ngOnInit() {
    this.detectDevice();

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
    });


    this.hasPasses = combineLatest(
        this.activePassProvider.length$,
        (l1) => l1 > 0
      );

      this.passesLoaded = combineLatest(
        this.activePassProvider.loaded$,
        (l1) => l1
      ).pipe(
        filter(v => v),
        delay(250),
        tap((res) => this.searchPending$.next(!res))
      );

      this.dialog.afterOpened.subscribe( (dialog) => {
        if (dialog.componentInstance instanceof ReportFormComponent) {
          this.isReportFormOpened = true;
        }
      });

      this.dialog.afterAllClosed.subscribe( () => {
        this.isReportFormOpened = false;
      });
  }

  ngOnDestroy() {
    if (this.scrollableArea && this.scrollableAreaName) {
      this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
    }
  }

  openReportForm() {

    const dialogRef = this.dialog.open(ReportFormComponent, {
      panelClass: ['form-dialog-container', this.isIOSTablet ? 'ios-report-dialog' : 'report-dialog'],
      backdropClass: 'custom-backdrop',
    });


    dialogRef.backdropClick().subscribe(() => {
      alert('backdrop');
    })
    dialogRef.afterClosed().pipe(
      filter(res => !!res),
      map(res => {
        this.sendReports = res;
        this.isActiveMessage = true;
        return res;
    }), delay(3000)).subscribe((dialog) => {
      this.isActiveMessage = false;
      this.isReportFormOpened = false;
    });

    this.reportFormInstance = dialogRef.componentInstance;
  }

  openSortMenu() {

      const dialogRef = this.dialog.open(SortMenuComponent, {
        position: { bottom: '1px' },
        panelClass: 'sort-dialog',
        data: {
          title: 'sort by',
          items: [
            {id: 1, title: 'pass expiration time', action: 'expiration_time'},
            {id: 2, title: 'student name', action: 'student_name'},
            {id: 3, title: 'destination', action: 'destination_name'},
          ],
          selectedItem: this.selectedSortOption
        }
      });

      dialogRef.componentInstance.onListItemClick.subscribe((item) =>  {
          this.dataService.sort$.next(item.action);
          this.selectedSortOption = item;
      });
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
    this.searchPending$.next(true);
    this.searchQuery$.next(search);
  }

  back() {
    this.reportFormInstance.back();
  }

  detectDevice() {
    this.isIpadWidth = this.screenService.isIpadWidth;
    this.isDeviceLargeExtra = this.screenService.isDeviceLargeExtra;

    if (this.screenService.isDeviceLargeExtra) {
      this.hallMonitorCollection.hasSort = false;
    }

    if (this.screenService.isDesktopWidth) {
      this.hallMonitorCollection.hasSort = true;
    }
  }

  @HostListener('window:resize')
  checkDeviceWidth() {
    this.detectDevice();
  }

  toggleSearchBar() {
    if (this.screenService.isDeviceLargeExtra) {
      this.isIpadSearchBar = !this.isIpadSearchBar;
    }
  }

  cleanSearchValue() {
    this.resetvalue.next('');
    this.inputValue = '';
    this.isIpadSearchBar = false;
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }
}
