import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {User} from '../../models/User';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {HallPassesService} from '../../services/hall-passes.service';
import {fromEvent, Observable} from 'rxjs';
import {QuickPreviewPasses} from '../../models/QuickPreviewPasses';
import {UserService} from '../../services/user.service';
import {School} from '../../models/School';
import {HallPass} from '../../models/HallPass';
import {filter, map, tap} from 'rxjs/operators';
import {UNANIMATED_CONTAINER} from '../../consent-menu-overlay';
import {SettingsDescriptionPopupComponent} from '../../settings-description-popup/settings-description-popup.component';
import {UserStats} from '../../models/UserStats';
import {DateTimeFilterComponent} from '../explore/date-time-filter/date-time-filter.component';
import * as moment from 'moment';
import {CreateHallpassFormsComponent} from '../../create-hallpass-forms/create-hallpass-forms.component';
import {ReportFormComponent} from '../../report-form/report-form.component';
import {ModelFilterComponent} from './model-filter/model-filter.component';
import {ToastService} from '../../services/toast.service';
import {MyProfileDialogComponent} from '../../my-profile-dialog/my-profile-dialog.component';
import {NotificationFormComponent} from '../../notification-form/notification-form.component';

@Component({
  selector: 'app-student-info-card',
  templateUrl: './student-info-card.component.html',
  styleUrls: ['./student-info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentInfoCardComponent implements OnInit, AfterViewInit {

  @ViewChild('left') left: ElementRef;
  @ViewChild('dateButton') dateButton: ElementRef;

  profile: User;

  loadingPassesStats$: Observable<boolean>;
  studentsStatsLoading$: Observable<boolean>;
  passesStats$: Observable<QuickPreviewPasses>;
  studentStats$: Observable<UserStats>;
  lastStudentPasses$: Observable<HallPass[]>;
  school: School;

  adminCalendarOptions;
  selectedDate: {start: moment.Moment, end: moment.Moment} = {
    start: moment('1/8/' + moment().year(), 'DD/MM/YYYY'),
    end: moment('31/7/' + moment().add(1, 'year').year(), 'DD/MM/YYYY')
  };
  isFullScreenPasses: boolean;
  isFullScreenReports: boolean;

  constructor(
    public dialogRef: MatDialogRef<StudentInfoCardComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialog: MatDialog,
    private passesService: HallPassesService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.profile = this.data['profile'];
    this.school = this.userService.getUserSchool();
    this.getUserStats();
    this.passesService.getQuickPreviewPassesRequest(6, true);
    this.lastStudentPasses$ = this.passesService.quickPreviewPasses$.pipe(map(passes => passes.map(pass => HallPass.fromJSON(pass))));
    this.loadingPassesStats$ = this.passesService.quickPreviewPassesLoading$;
    this.passesStats$ = this.passesService.quickPreviewPassesStats$;
    this.studentStats$ = this.userService.studentsStats$.pipe(map(stats => stats[this.profile.id]));
    this.studentsStatsLoading$ = this.userService.studentsStatsLoading$;
  }

  ngAfterViewInit() {
    fromEvent(this.left.nativeElement, 'scroll').subscribe(res => {
      console.log(res);
    });
  }

  getDate(date) {
    return moment(date).format('MMM YYYY') + ' at ' + moment(date).format('hh:mm A');
  }

  getUserStats() {
    this.userService.getUserStatsRequest(this.profile.id, {
      // 'created_after': this.selectedDate.end.toISOString(),
      'created_after': this.selectedDate.start.toISOString()
    });
  }

  openStudentSettings(elem) {
    const settings = [
      {
        label: 'Copy private link',
        icon: './assets/Private Link (Blue-Gray).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: 'link'
      },
      {
        label: 'Edit status',
        icon: './assets/Account Mark (Blue-Gray).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: 'status',
        disableClose: true
      },
      {
        label: 'Change password',
        icon: './assets/Change Password (Blue-Gray).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: 'password'
      },
      {
        label: 'Delete Account',
        icon: './assets/Delete (Red).svg',
        textColor: '#E32C66',
        backgroundColor: '#F4F4F4',
        confirmButton: true,
        description: 'Are you sure?',
        action: 'delete'
      }
    ];
    UNANIMATED_CONTAINER.next(true);
    const st = this.dialog.open(SettingsDescriptionPopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {trigger: elem.currentTarget, settings, profile: this.profile }
    });

    st.afterClosed().pipe(tap(() => UNANIMATED_CONTAINER.next(false)))
      .subscribe((action) => {
        if (action === 'link') {
          navigator.clipboard.writeText(`${window.location.href}?student_id=${this.profile.id}`).then(() => {
            this.toast.openToast({
              title: 'Link copied to clipboard!',
              subtitle: 'Send this link to other admins if you want to share with them student information.',
              type: 'info'
            });
          });
        } else if (action === 'password') {
          this.dialog.open(MyProfileDialogComponent, {
            panelClass: 'sp-form-dialog',
            width: '425px',
            height: '500px',
            data: {target: 'password', profile: this.profile}
          });
        }
      });
  }

  openCreatePassPopup(elem) {
    const settings = [
      {
        label: 'Create pass for now',
        icon: './assets/Plus (Blue-Gray).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: 'now'
      },
      {
        label: 'Schedule pass',
        icon: './assets/Schedule pass (Blue-Gray).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: 'feature'
      }
    ];
    UNANIMATED_CONTAINER.next(true);
    const st = this.dialog.open(SettingsDescriptionPopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {trigger: elem.currentTarget, settings }
    });

    st.afterClosed().pipe(tap(() => UNANIMATED_CONTAINER.next(false)))
      .subscribe((action) => {
        const mainFormRef = this.dialog.open(CreateHallpassFormsComponent, {
          panelClass: 'main-form-dialog-container',
          backdropClass: 'custom-backdrop',
          maxWidth: '100vw',
          data: {
            'forLater': action === 'feature',
            'forStaff': true,
            'forInput': true,
            'fromAdmin': true,
            'adminSelectedStudent': this.profile
          }
        });
    });
  }

  openDateFilter(event) {
    UNANIMATED_CONTAINER.next(true);
    const calendar = this.dialog.open(DateTimeFilterComponent, {
      id: 'calendar_filter',
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        target: new ElementRef(event.currentTarget),
        date: this.selectedDate,
        options: this.adminCalendarOptions
      }
    });

    calendar.afterClosed()
      .pipe(
        tap(() => UNANIMATED_CONTAINER.next(false)),
        filter(res => res)
      )
      .subscribe(({date, options}) => {
        this.adminCalendarOptions = options;
        if (!date.start) {
          this.selectedDate = {start: moment(date).add(6, 'minutes'), end: moment(date).add(6, 'minutes')};
        } else {
          this.selectedDate = {start: date.start.startOf('day'), end: date.end.endOf('day')};
        }
        this.getUserStats();
        this.cdr.detectChanges();
      });
  }

  openReportForm() {
    const RF = this.dialog.open(ReportFormComponent, {
      panelClass: ['form-dialog-container', 'report-dialog'],
      backdropClass: 'custom-backdrop',
      width: '425px',
      height: '500px',
      data: {report: this.profile}
    });
  }

  openFilter({event, action}) {
    const settings = [
      {title: 'Compare with another student', icon: './assets/Compare Students (Blue-Gray).svg', action: 'compare'}
    ];
    if (action === 'Passes') {
      settings.unshift({title: 'Filter passes', icon: './assets/Filter (Blue-Gray).svg', action: 'filter'});
      settings.push({title: 'Explore all passes', icon: './assets/Passes (Blue-Gray).svg', action: 'explore'});
      const PF = this.dialog.open(ModelFilterComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {trigger: event.currentTarget, settings }
      });

      PF.afterClosed().pipe(filter(r => !!r)).subscribe((value) => {
        if (value === 'filter') {
          this.openDateFilter(this.dateButton.nativeElement);
        }
      });
    } else if (action === 'Reports') {
      settings.unshift({title: 'Filter reports', icon: './assets/Filter (Blue-Gray).svg', action: 'filter'});
      settings.push({title: 'Explore all reports', icon: './assets/Passes (Blue-Gray).svg', action: 'explore'});
      const PF = this.dialog.open(ModelFilterComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {trigger: event.currentTarget, settings }
      });
    } else if (action === 'Overview') {
      const PF = this.dialog.open(ModelFilterComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {trigger: event.currentTarget }
      });
    }
  }

  openNotification() {
    this.dialog.open(NotificationFormComponent, {
      panelClass: 'form-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {profile: this.profile}
    });
  }

  dateText({start, end}): string {
    if (start.isSame(moment().subtract(3, 'days'), 'day')) {
      return 'Last 3 days';
    } else if (start.isSame(moment().subtract(7, 'days'), 'day')) {
      return  'Last 7 days';
    } else if (start.isSame(moment().subtract(30, 'days'), 'day')) {
      return 'Last 30 days';
    } else if (start.isSame(moment().subtract(90, 'days'), 'day')) {
      return 'Last 90 days';
    } else if (start.isSame(moment('1/8/' + moment().year(), 'DD/MM/YYYY'))) {
      return 'This school year';
    }
    if (start && end) {
      return start.isSame(end, 'day') ? start.format('MMM D') : start.format('MMM D') + ' to ' + end.format('MMM D');
    }
  }

}
