import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Util } from '../../../Util';
import { DateTimeFilterComponent } from '../../admin/explore/date-time-filter/date-time-filter.component';
import { StatusPopupComponent } from '../../admin/profile-card-dialog/status-popup/status-popup.component';
import { UNANIMATED_CONTAINER } from '../../consent-menu-overlay';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { HallPass } from '../../models/HallPass';
import { StudentPassLimit } from '../../models/HallPassLimits';
import { QuickPreviewPasses } from '../../models/QuickPreviewPasses';
import { School } from '../../models/School';
import { User } from '../../models/User';
import { UserStats } from '../../models/UserStats';
import { IntroData } from '../../ngrx/intros';
import { PassCardComponent } from '../../pass-card/pass-card.component';
import { EncounterPreventionService } from '../../services/encounter-prevention.service';
import { HallPassesService } from '../../services/hall-passes.service';
import { HttpService } from '../../services/http-service';
import { IDCardService } from '../../services/IDCardService';
import { ParentAccountService } from '../../services/parent-account.service';
import { PassLimitService } from '../../services/pass-limit.service';
import { QRBarcodeGeneratorService } from '../../services/qrbarcode-generator.service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';
import { SettingsDescriptionPopupComponent } from '../../settings-description-popup/settings-description-popup.component';
import { ConfirmationComponent } from '../../shared/shared-components/confirmation/confirmation.component';
import { ModelFilterComponent } from '../../student-info-card/model-filter/model-filter.component';

@Component({
  selector: 'app-student-info',
  templateUrl: './student-info.component.html',
  styleUrls: ['./student-info.component.scss'],
  // animations: [ResizeProfileImage],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentInfoComponent implements OnInit, AfterViewInit, OnDestroy  {

  @ViewChild('left') left: ElementRef;
  @ViewChild('right') right: ElementRef;
  @ViewChild('dateButton') dateButton: ElementRef;
  @ViewChild('avatar') avatar: ElementRef;
  @ViewChild('editIcon') editIcon: ElementRef;

  profile: User;

  loadingPassesStats$: Observable<boolean>;
  studentsStatsLoading$: Observable<boolean>;
  passesStats$: Observable<QuickPreviewPasses>;
  studentStats$: Observable<UserStats>;
  lastStudentPasses$: Observable<HallPass[]>;

  // exclusionGroups$: Observable<ExclusionGroup[]>;
  // exclusionGroupsLoading$: Observable<boolean>;
  user: User;

  school: School;
  studentPassLimitSubs: Subscription;
  studentPassLimit: StudentPassLimit;

  adminCalendarOptions = {
    rangeId: 'range_6',
    toggleResult: 'Range'
  };
  selectedDate: { start: moment.Moment, end: moment.Moment } = {
    start: moment('1/8/2022', 'DD/MM/YYYY'),
    end: moment().endOf('day')
  };
  isFullScreenPasses: boolean;
  isFullScreenReports: boolean;

  isScrollable: boolean;
  isRightScroll: boolean;
  animationTrigger = {value: 'open', params: {size: '88'}};
  profileEmail: string;

  isOpenAvatarDialog: boolean;
  loadingProfilePicture: Subject<boolean> = new Subject<boolean>();
  schoolsLength$: Observable<number>;
  destroy$: Subject<any> = new Subject<any>();
  introsData: IntroData;
  introSubs: Subscription;
  // showPassLimitNux = new Subject<boolean>();
  // passLimitStudentInfoRef: MatDialogRef<PassLimitStudentInfoComponent>;
  // IDCardEnabled = false;
  // IDCARDDETAILS: any;

  constructor(
    private dialog: MatDialog,
    private passesService: HallPassesService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private encounterPreventionService: EncounterPreventionService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    private darkTheme: DarkThemeSwitch,
    private passLimitsService: PassLimitService,
    private qrBarcodeGenerator: QRBarcodeGeneratorService,
    private idCardService: IDCardService,
    private parentService: ParentAccountService,
  ) { }

  @HostListener('document.scroll', ['$event'])
  scroll(event) {
    if (event.currentTarget.scrollTop > 20) {
      this.isScrollable = true;
      // this.animationTrigger = {value: 'close', params: {size: '32'}};
    } else {
      this.isScrollable = false;
      // this.animationTrigger = {value: 'open', params: {size: '88'}};
    }
  }

  get accountType() {
    if (this.profile.demo_account) {
      return 'Demo';
    }

    const sync_type = this.profile.sync_types[0];
    if (sync_type === 'google') {
      return 'G Suite';
    }
    if (sync_type === 'gg4l') {
      return 'GG4L';
    }
    if (sync_type === 'clever') {
      return 'Clever';
    }
    return 'Standard';
  }

  get isLongName() {
    return this.profile.display_name.length > 20;
  }

  ngOnInit(): void {
    this.school = this.userService.getUserSchool();
    this.schoolsLength$ = this.http.schoolsLength$;
    this.userService.user$.pipe(
      takeUntil(this.destroy$),
      filter(r => !!r),
      map(u => User.fromJSON(u))
    )
      .subscribe(user => {
        this.user = user;
        console.log("User : ", this.user)
      });

    this.route.params.pipe(
      filter(params => 'id' in params),
      switchMap(params => this.userService.searchProfileById(params['id'])),
      takeUntil(this.destroy$)
    ).subscribe({
      next: user => {
        this.profile = user;
        console.log("profile : ", this.profile)
        this.school = this.userService.getUserSchool();
        this.passesService.getQuickPreviewPassesRequest(this.profile.id, true);
        this.getUserStats();
        this.studentStats$ = this.userService.studentsStats$.pipe(map(stats => stats[this.profile.id]));
        // this.encounterPreventionService.getExclusionGroupsRequest({student: this.profile.id});

        // if (this.studentPassLimitSubs) {
        //   this.studentPassLimitSubs.unsubscribe();
        // }

        // this.studentPassLimitSubs = merge(
        //   this.passLimitsService.watchPassLimits(),
        //   this.passLimitsService.watchIndividualPassLimit(this.profile.id)
        // )
        //   .pipe(concatMap(() => this.passLimitsService.getStudentPassLimit(this.profile.id)))
        //   .subscribe(res => {
        //     this.studentPassLimit = res;
        //     this.cdr.detectChanges();
        //   });
      }
    });

    // this.exclusionGroups$ = this.encounterPreventionService.exclusionGroups$;
    // this.exclusionGroupsLoading$ = this.encounterPreventionService.exclusionGroupsLoading$;
    this.lastStudentPasses$ = this.passesService.quickPreviewPasses$.pipe(map(passes => passes.map(pass => HallPass.fromJSON(pass))));
    this.loadingPassesStats$ = this.passesService.quickPreviewPassesLoading$;
    this.passesStats$ = this.passesService.quickPreviewPassesStats$;
    this.studentsStatsLoading$ = this.userService.studentsStatsLoading$;

    // this.passesService.createPassEvent$.pipe(take(1)).subscribe(res => {
    //   this.router.navigate(['/main/passes']);
    // });

    this.userService.currentUpdatedAccount$._profile_student.pipe(filter(r => !!r))
      .subscribe(user => {
        this.profile = user;
        this.cdr.detectChanges();
        this.userService.clearCurrentUpdatedAccounts();
      });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.introSubs = this.userService.introsData$.pipe(filter(i => !!i)).subscribe({
        next: intros => {
          this.introsData = intros;
          // this.showPassLimitNux.next(!intros?.student_pass_limit?.universal?.seen_version);
        }
      });
    }, 3000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.introSubs) {
      this.introSubs.unsubscribe();
    }
  }

  getDate(date) {
    return moment(date).format('MMM YYYY') + ' at ' + moment(date).format('hh:mm A');
  }

  getLastActiveDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  getEmailOrUsername() {
    if (this.profile.primary_email.includes('@spnx.local')) {
      this.profileEmail = this.profile.primary_email.replace('@spnx.local', '');
      return 'Username';
    } else {
      this.profileEmail = this.profile.primary_email;
      return 'Email';
    }
  }

  secondToTime(seconds) {
    if (!seconds) {
      return '0 min';
    }
    let time = '';
    const days = moment.duration(seconds * 1000).days();
    let hours = moment.duration(seconds * 1000).hours();
    const minutes = moment.duration(seconds * 1000).minutes();
    if (days > 0) {
      hours = hours + (days * 24);
    }
    if (hours > 0) {
      time += hours + 'hr ';
    }
    time += (minutes < 1 && moment.duration(seconds * 1000).seconds() > 1 ? 1 : minutes) + ' min';
    return time;
  }

  getUserStats() {
    this.userService.getUserStatsRequest(this.profile.id, {
      'created_after': this.selectedDate.start.toISOString(),
      'end_time_before': this.selectedDate.end.toISOString()
    });
  }

  back() {
    window.history.back();
  }

  openStudentSettings(elem) {
    const settings: any = [
      {
        label: 'Remove student',
        icon: './assets/icons/minus-icon (Red).svg',
        textColor: '#E32C66',
        backgroundColor: '#F4F4F4',
        action: 'remove_student',
        // tooltip: 'Copy a private link to this student and send it to another staff member at your school.'
      },
    ];
    UNANIMATED_CONTAINER.next(true);
    const st = this.dialog.open(SettingsDescriptionPopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {trigger: elem.currentTarget, settings, profile: this.profile}
    });

    st.afterClosed().pipe(tap(() => UNANIMATED_CONTAINER.next(false)))
      .subscribe(async (action) => {
        if (action === 'remove_student') {
          let data = {
            title: `Remove ${this.profile?.display_name}`,
            message: "When you remove a student, they will be unliked from your parent account. The student's account will not be deleted.",
            okButtonText: "Remove",
          };
          this.openConfirmationDialog(data).then((res) => {
            if (res) {
              this.parentService.removeStudent(this.profile.id).subscribe({
                next: (result: any) => {
                  this.back();
                },
                error: (error: any) => {
                  console.log("Error : ", error);
                },
              });
            }
          });
        }
      });
  }

  openConfirmationDialog(data) {
    return new Promise((resolve) => {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        panelClass: "search-pass-card-dialog-container",
        backdropClass: "custom-bd",
        disableClose: true,
        data: data,
      });

      dialogRef.afterClosed().subscribe((result) => {
        return resolve(result);
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
        data: {trigger: event.currentTarget, settings}
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
        data: {trigger: event.currentTarget, settings}
      });
    } else if (action === 'Overview') {
      const PF = this.dialog.open(ModelFilterComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {trigger: event.currentTarget}
      });
    }
  }


  openStatusPopup(elem) {
    const SPC = this.dialog.open(StatusPopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': elem.currentTarget,
        'profile': this.profile,
        'profileStatus': this.profile.status,
        'withoutDelete': true
      }
    });

    SPC.afterClosed()
      .pipe(
        filter(res => !!res),
      ).subscribe((status) => {
      this.userService.updateUserRequest(this.profile, {status});
      this.toast.openToast({title: 'Account status updated', type: 'success'});
    });
  }

  genOption(display, color, action, icon?) {
    return {display, color, action, icon};
  }

  openPassCard({time$, pass}) {
    pass.start_time = new Date(pass.start_time);
    pass.end_time = new Date(pass.end_time);
    const data = {
      pass: pass,
      fromPast: true,
      forFuture: false,
      forMonitor: false,
      isActive: false,
      forStaff: true,
    };
    const dialogRef = this.dialog.open(PassCardComponent, {
      panelClass: 'search-pass-card-dialog-container',
      backdropClass: 'custom-bd',
      data: data,
    });
  }

  // openReportInfo(report) {
  //   this.dialog.open(ReportInfoDialogComponent, {
  //     panelClass: 'overlay-dialog',
  //     backdropClass: 'custom-bd',
  //     data: {report: report}
  //   });
  // }

  dateText({start, end}): string {
    if (start.isSame(moment().subtract(3, 'days'), 'day')) {
      return 'Last 3 days';
    }
    if (start.isSame(moment().subtract(7, 'days'), 'day')) {
      return 'Last 7 days';
    }
    if (start.isSame(moment().subtract(30, 'days'), 'day')) {
      return 'Last 30 days';
    }
    if (start.isSame(moment().subtract(90, 'days'), 'day')) {
      return 'Last 90 days';
    }
    if (start.isSame(moment('1/8/' + moment().subtract(1, 'year').year(), 'DD/MM/YYYY'))) {
      return 'This school year';
    }
    if (start && end) {
      return start.isSame(end, 'day') ? start.format('MMM D') : start.format('MMM D') + ' to ' + end.format('MMM D');
    }
  }

  // dismissPassLimitNux() {
  //   this.showPassLimitNux.next(false);
  //   this.userService.updateIntrosStudentPassLimitRequest(this.introsData, 'universal', '1');
  // }

}
