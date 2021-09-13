import {Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, combineLatest, interval, merge, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {DataService} from '../services/data-service';
import {mergeObject} from '../live-data/helpers';
import {HallPassFilter, LiveDataService} from '../live-data/live-data.service';
import {LoadingService} from '../services/loading.service';
import {User} from '../models/User';
import {ReportFormComponent} from '../report-form/report-form.component';
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
import {InputRestriciontSm} from '../models/input-restrictions/InputRestriciontSm';
import {CollectionRestriction} from '../models/collection-restrictions/CollectionRestriction';
import {HallMonitorCollectionRestriction} from '../models/collection-restrictions/HallMonitorCollectionRestriction';
import {ScrollPositionService} from '../scroll-position.service';
import {DeviceDetection} from '../device-detection.helper';

@Component({
  selector: 'app-hall-monitor',
  templateUrl: './hall-monitor.component.html',
  styleUrls: ['./hall-monitor.component.scss']
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

  activePassProvider: any;

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
  isSearchClicked: boolean;
  resetvalue = new Subject();

  isIpadWidth: boolean;
  isIpadSearchBar: boolean;
  isDeviceLargeExtra: boolean;

  reportBtn: ButtonRestriction = new ReportButtonRestriction();
  sortBtn: ButtonRestriction = new SortBtnRestriction();
  inputRestrictionSm: InputRestriction = new InputRestriciontSm();
  hallMonitorCollection: CollectionRestriction = new HallMonitorCollectionRestriction();

  selectedSortOption: any = {id: 1, title: 'pass expiration time', action: 'expiration_time'};
  sortMode: string = '';

  destroy$: Subject<any> = new Subject();

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
    this.activePassProvider = this.liveDataService.hallMonitorPasses$;
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
    .pipe(
      this.loadingService.watchFirst,
      takeUntil(this.destroy$)
    )
    .subscribe((v) => {
        this.user = v.cu;
        this.effectiveUser = v.eu;
        this.isStaff = v.cu.roles.includes('_profile_teacher');
        this.canView = this.user.roles.includes('access_hall_monitor');
    });


    this.hasPasses = combineLatest(
        this.liveDataService.hallMonitorPassesTotalNumber$,
        (l1) => l1 > 0
      );

      this.passesLoaded = combineLatest(
        this.liveDataService.hallMonitorPassesLoaded$,
        (l1) => l1
      ).pipe(
        filter(v => v),
        tap((res) => this.searchPending$.next(!res))
      );

      this.dialog.afterAllClosed.subscribe( () => {
        this.isReportFormOpened = false;
      });
  }

  ngOnDestroy() {
    if (this.scrollableArea && this.scrollableAreaName) {
      this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  openReportForm() {
    this.isReportFormOpened = true;
    const dialogRef = this.dialog.open(ReportFormComponent, {
      panelClass: ['form-dialog-container', this.isIOSTablet ? 'ios-report-dialog' : 'report-dialog'],
      backdropClass: 'custom-backdrop',
    });

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
      const SM = this.dialog.open(SortMenuComponent, {
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

      SM.componentInstance.onListItemClick.subscribe((item) =>  {
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
    this.updatePassCollection(this.sortMode);
  }

  updatePassCollection(sort) {
    this.sortMode = sort;
    const sort$ = of(this.sortMode).pipe(map(s => ({sort: s})));
    const search$ = this.searchQuery$.pipe(map(s => ({search_query: s})));
    const merged$ = mergeObject({sort: '-created', search_query: ''}, merge(sort$, search$));

    const mergedReplay = new ReplaySubject<HallPassFilter>(1);
    merged$.subscribe(mergedReplay);
    this.liveDataService.updateHallMonitorPassesRequest(merged$);
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
