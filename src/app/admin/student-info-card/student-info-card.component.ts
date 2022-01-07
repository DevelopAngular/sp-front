import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
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

@Component({
  selector: 'app-student-info-card',
  templateUrl: './student-info-card.component.html',
  styleUrls: ['./student-info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentInfoCardComponent implements OnInit, AfterViewInit {

  @ViewChild('left') left: ElementRef;

  profile: User;

  loadingPassesStats$: Observable<boolean>;
  studentsStatsLoading$: Observable<boolean>;
  passesStats$: Observable<QuickPreviewPasses>;
  studentStats$: Observable<UserStats>;
  lastStudentPasses$: Observable<HallPass[]>;
  school: School;

  adminCalendarOptions;
  selectedDate: {start: moment.Moment, end: moment.Moment};
  isFullScreenPasses: boolean;
  isFullScreenReports: boolean;

  constructor(
    public dialogRef: MatDialogRef<StudentInfoCardComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialog: MatDialog,
    private passesService: HallPassesService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.profile = this.data['profile'];
    this.school = this.userService.getUserSchool();
    this.userService.getUserStatsRequest(this.profile.id);
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

  openStudentSettings(event) {
    const settings = [
      {
        label: 'Copy private link',
        icon: '',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: ''
      },
      {
        label: 'Edit status',
        icon: './assets/Add Account (White).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: ''
      },
      {
        label: 'Change password',
        icon: './assets/Change Password (Blue-Gray).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: ''
      },
      {
        label: 'Delete Account',
        icon: './assets/Delete (Red).svg',
        textColor: '#E32C66',
        backgroundColor: '#F4F4F4',
        confirmButton: true,
        description: 'Are you sure?',
        action: ''
      }
    ];
    UNANIMATED_CONTAINER.next(true);
    const st = this.dialog.open(SettingsDescriptionPopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {trigger: event.currentTarget, settings }
    });

    st.afterClosed().pipe(tap(() => UNANIMATED_CONTAINER.next(false))).subscribe();
  }

  openCreatePassPopup(event) {
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
      data: {trigger: event.currentTarget, settings }
    });

    st.afterClosed().pipe(tap(() => UNANIMATED_CONTAINER.next(false))).subscribe((action) => {
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
        target: new ElementRef(event),
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
      });
  }

  openReportForm() {
    const dialogRef = this.dialog.open(ReportFormComponent, {
      panelClass: ['form-dialog-container', 'report-dialog'],
      backdropClass: 'custom-backdrop',
      width: '425px',
      height: '500px',
      data: {report: this.profile}
    });
  }

}
