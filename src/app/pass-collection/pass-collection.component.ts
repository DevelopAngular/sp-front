import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {DataService} from '../services/data-service';
import {InvitationCardComponent} from '../invitation-card/invitation-card.component';
import {HallPass} from '../models/HallPass';
import {Invitation} from '../models/Invitation';
import {Request} from '../models/Request';
import {PassLike} from '../models';
import {PassCardComponent} from '../pass-card/pass-card.component';
import {ReportFormComponent} from '../report-form/report-form.component';
import {RequestCardComponent} from '../request-card/request-card.component';
import {filter, take, takeUntil, tap} from 'rxjs/operators';
import {TimeService} from '../services/time.service';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {KioskModeService} from '../services/kiosk-mode.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ScreenService} from '../services/screen.service';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {HallPassesService} from '../services/hall-passes.service';
import {SpAppearanceComponent} from '../sp-appearance/sp-appearance.component';
import {User} from '../models/User';
import {UserService} from '../services/user.service';
import * as moment from 'moment';

export class SortOption {
  constructor(private name: string, public value: string) {
  }

  toString() {
    return this.name;
  }
}

@Component({
  selector: 'app-pass-collection',
  templateUrl: './pass-collection.component.html',
  styleUrls: ['./pass-collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PassCollectionComponent implements OnInit, OnDestroy {

  @Input() mock = false;
  @Input() displayState = 'grid';
  @Input() title: string;
  @Input() icon: string;
  @Input() emptyMessage;
  @Input() columns = 3;
  @Input() fromPast = false;
  @Input() forFuture = false;
  @Input() isActive = false;
  @Input() forStaff = false;
  @Input() forMonitor = false;
  @Input() hasSort = false;
  @Input() maxHeight;
  @Input() showEmptyHeader: boolean;
  @Input() columnViewIcon: boolean = true;
  @Input() smoothlyUpdating: boolean = false;
  @Input() grid_template_columns: string = '143px';
  @Input() grid_gap: string = '10px';
  @Input() isAdminPage: boolean;
  @Input() headerWidth: string = '100%';
  @Input() passProvider: Observable<any>;
  @Input() hasFilterPasses: boolean;
  @Input() filterModel: string;
  @Input() filterDate: moment.Moment;
  @Input() user: User;
  @Input() selectedSort = null;
  @Input() searchPanel: boolean;
  @Input() showProfilePictures: boolean = true;

  @Output() sortMode = new EventEmitter<string>();
  @Output() reportFromPassCard = new EventEmitter();
  @Output() currentPassesEmit = new EventEmitter();
  @Output() filterPasses = new EventEmitter();
  @Output() passClick = new EventEmitter<boolean>();
  @Output() searchValue = new EventEmitter<string>();
  @Output() randomString = new EventEmitter<string>();

  currentPasses$: Observable<any>;
  activePassTime$;
  search: string;
  timers: number[] = [];
  timerEvent: Subject<void> = new BehaviorSubject(null);
  sort$ = this.dataService.sort$;

  isEnabledProfilePictures$: Observable<boolean>;

  destroy$ = new Subject();

  @HostListener('window:resize')
  checkDeviceWidth() {
    if (this.screenService.isDeviceSmallExtra) {
      this.grid_template_columns = '143px';
    }

    if (!this.screenService.isDeviceSmallExtra && this.screenService.isDeviceMid) {
      this.grid_template_columns = '157px';
    }
  }

  private static getDetailDialog(pass: PassLike): any {
    if (pass instanceof HallPass) {
      return PassCardComponent;
    }

    if (pass instanceof Invitation) {
      return InvitationCardComponent;
    }

    // noinspection SuspiciousInstanceOfGuard
    if (pass instanceof Request) {
      return RequestCardComponent;
    }

    return null;
  }
  constructor(
      public dialog: MatDialog,
      private dataService: DataService,
      private timeService: TimeService,
      public darkTheme: DarkThemeSwitch,
      private kioskMode: KioskModeService,
      private sanitizer: DomSanitizer,
      public screenService: ScreenService,
      private cdr: ChangeDetectorRef,
      private passesService: HallPassesService,
      private userService: UserService,
  ) {}

  get gridTemplate() {
    if (this.screenService.isDeviceMid && !this.screenService.isDeviceSmallExtra) {
      this.grid_template_columns = '157px';
    }
    return this.sanitizer.bypassSecurityTrustStyle(`repeat(auto-fill, ${this.grid_template_columns})`);
  }

  get gridGap() {
    return this.grid_gap;
  }

  get _color() {
    return this.darkTheme.getColor({dark: '#FFFFFF', white: '#1F195E'});
  }

  get selectedText() {
    if (this.selectedSort === 'past-hour') {
      return 'Past hour';
    } else if (this.selectedSort === 'today') {
      return 'Today';
    } else if (this.selectedSort === 'past-three-days') {
      return 'Past 3 days';
    } else if (this.selectedSort === 'past-seven-days') {
      return 'Past 7 days';
    } else if (this.selectedSort === 'past-seven-days') {
      return null;
    }
  }

  ngOnInit() {
    if (this.passProvider) {
      this.currentPasses$ = this.passProvider.pipe(
        tap(passes => this.currentPassesEmit.emit(passes)),
      );

      this.currentPasses$.pipe(filter(r => !!r.length), take(1)).subscribe((passes) => {
          const pass = passes[Math.floor(Math.random() * passes.length)];
          const destinationName = pass.destination.title;
          // const studentName = pass.student.display_name;
          const random = [destinationName];
          this.randomString.emit(random[Math.floor(Math.random() * random.length)]);
      });
    }

    if (this.isActive) {
      this.timers.push(window.setInterval(() => {
        this.timerEvent.next(null);
        this.cdr.detectChanges();
      }, 1000));
    }

    this.userService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
    });

    this.isEnabledProfilePictures$ = this.userService.isEnableProfilePictures$;
  }

  ngOnDestroy() {
    this.timers.forEach(id => {
      clearInterval(id);
    });
    this.timers = [];
    this.destroy$.next();
    this.destroy$.complete();
  }

  get _icon() {
    return this.darkTheme.getIcon({
      iconName: this.icon,
      darkFill: 'White',
      lightFill: 'Navy',
      setting: null
    });
  }

  getEmptyMessage() {
    return this.emptyMessage;
  }

  showPass({time$, pass}) {
    this.activePassTime$ = time$;
    this.passClick.emit(true);
    this.dataService.markRead(pass).subscribe();
    this.initializeDialog(pass);
  }

  openFilter(target) {
    const sortOptions = [
      { display: 'Past hour', color: this.darkTheme.getColor(), action: 'past-hour'},
      { display: 'Today', color: this.darkTheme.getColor(), action: 'today'},
      { display: 'Past 3 days', color: this.darkTheme.getColor(), action: 'past-three-days'},
      { display: 'Past 7 days', color: this.darkTheme.getColor(), action: 'past-seven-days'},
      { display: 'All Time', color: this.darkTheme.getColor(), action: 'all_time', divider: this.user.show_expired_passes && !User.fromJSON(this.user).isStudent() }
    ];
    if (this.user.show_expired_passes && User.fromJSON(this.user).isTeacher()) {
      sortOptions.push({ display: 'Hide Expired Passes', color: this.darkTheme.getColor(), action: 'hide_expired_pass' });
    }
    const filterDialog = this.dialog.open(DropdownComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': target.currentTarget,
        'sortData': sortOptions,
        'selectedSort': this.selectedSort || 'all_time',
        'maxHeight': '332px'
      }
    });

    filterDialog.afterClosed()
      .pipe(filter(res => !!res))
      .subscribe(action => {
        if (action !== 'hide_expired_pass') {
          if (this.selectedSort === action || action === 'all_time') {
            this.selectedSort = null;
          } else {
            this.selectedSort = action;
          }
          this.cdr.detectChanges();
          this.passesService.updateFilterRequest(this.filterModel, this.selectedSort);
          this.passesService.filterExpiredPassesRequest(this.user, this.selectedSort);
          this.filterPasses.emit(this.selectedSort);
        } else {
          this.openAppearance();
        }
    });
  }

  openAppearance() {
    this.dialog.open(SpAppearanceComponent, {
      panelClass: 'sp-form-dialog',
      data: {fromFilter: true}
    });
  }

  onSortSelected(sort: string) {
    this.sort$.next(sort);
    this.sortMode.emit(sort);
  }

  initializeDialog(pass: PassLike) {
    const now = this.timeService.nowDate();
    now.setSeconds(now.getSeconds() + 10);

    let data: any;

    if (pass instanceof HallPass) {
      data = {
        pass: pass,
        fromPast: pass['end_time'] < now,
        forFuture: pass['start_time'] > now,
        forMonitor: this.forMonitor,
        forStaff: this.forStaff && !this.kioskMode.getCurrentRoom().value,
        kioskMode: !!this.kioskMode.getCurrentRoom().value,
        hideReport: this.isAdminPage,
        activePassTime$: this.activePassTime$,
        showStudentInfoBlock: !this.kioskMode.getCurrentRoom().value
      };
      data.isActive = !data.fromPast && !data.forFuture;
    } else {
      data = {
        pass: pass,
        fromPast: this.fromPast,
        forFuture: this.forFuture,
        forMonitor: this.forMonitor,
        isActive: this.isActive,
        forStaff: this.forStaff,
      };
    }
    const dialogRef = this.dialog.open(PassCollectionComponent.getDetailDialog(pass), {
      panelClass: (this.forStaff ? 'teacher-' : 'student-') + 'pass-card-dialog-container',
      backdropClass: 'custom-backdrop',
      data: data,
    });

    dialogRef.afterClosed().subscribe(dialogData => {
      this.passClick.emit(false);
      if (dialogData && dialogData['report']) {
        const reportRef = this.dialog.open(ReportFormComponent, {
          width: '425px',
          height: '500px',
          panelClass: 'form-dialog-container',
          backdropClass: 'custom-backdrop',
          data: {'report': dialogData['report']}
        });
      }
    });
  }

  openSortDialog(event) {
    const sortOptions = [
      { display: 'Pass Expiration Time', color: this.darkTheme.getColor(), action: 'expiration_time', toggle: false },
      { display: 'Student Name', color: this.darkTheme.getColor(), action: 'student_name', toggle: false },
      { display: 'To Location', color: this.darkTheme.getColor(), action: 'destination_name', toggle: false }
    ];
    UNANIMATED_CONTAINER.next(true);

    const sortDialog = this.dialog.open(DropdownComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': event.currentTarget,
        'sortData': sortOptions,
        'selectedSort': this.selectedSort
      }
    });

    sortDialog.afterClosed()
      .pipe(
        tap(() => UNANIMATED_CONTAINER.next(false)),
        filter(res => !!res)
      )
      .subscribe(sortMode => {
        this.selectedSort = sortMode;
        this.onSortSelected(this.selectedSort);
      });
  }

  getSearchInputPlaceholder(passes: HallPass[]) {
    return `Search ${passes[Math.floor(Math.random() * passes.length)].destination.title}`;
  }
}
