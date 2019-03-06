import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
import { MatDialog } from '@angular/material';
import {BehaviorSubject, fromEvent} from 'rxjs';
import { User } from '../../models/User';
import { Report } from '../../models/Report';
import { Pinnable } from '../../models/Pinnable';
import { ActivePassProvider } from '../../hall-monitor/hall-monitor.component';
import { LiveDataService } from '../../live-data/live-data.service';
import {PassLikeProvider, WrappedProvider} from '../../models/providers';
import { TimeService } from '../../services/time.service';
import {CalendarComponent} from '../calendar/calendar.component';
import {HttpService} from '../../services/http-service';
import {Util} from '../../../Util';
import {map, switchMap, toArray} from 'rxjs/operators';
import { disableBodyScroll } from 'body-scroll-lock';
import {AdminService} from '../../services/admin.service';
import {combineLatest, Observable, of} from 'rxjs';



@Component({
  selector: 'app-hallmonitor',
  templateUrl: './hallmonitor.component.html',
  styleUrls: ['./hallmonitor.component.scss']
})
export class HallmonitorComponent implements OnInit {

    @ViewChild('bottomShadow') bottomShadow;
    activePassProvider: WrappedProvider;
    searchQuery$ = new BehaviorSubject('');
    minDate: Date;
    input_value1: string;
    input_value2: string;
    input_DateRange: string;
    activeCalendar: boolean;
    choices = ['Origin', 'Destination', 'Both'];
    selectedtoggleValue: string = this.choices[0];

    rooms: Pinnable[];

    selectedStudents: User[] = [];
    studentreport: Report[]|any[] = [];

    min: Date = new Date('December 17, 1995 03:24:00');
    calendarToggled = false;
    searchDate$ = new BehaviorSubject<Date>(null);

    calendarToggled_2nd = false;
    searchDate_1st$ = new BehaviorSubject<Date>(null);
    searchDate_2nd$ = new BehaviorSubject<Date>(null);

    passesLoaded: Observable<boolean> = of(false);

    hasPasses: Observable<boolean> = of(false);

    inactiveIcon: boolean = true;

    public reportsDate: Date;

    constructor(
        public dialog: MatDialog,
        private liveDataService: LiveDataService,
        private http: HttpService,
        private adminService: AdminService,
        private elRef: ElementRef,
        private timeService: TimeService,

    ) {
      this.activePassProvider = new WrappedProvider(new ActivePassProvider(this.liveDataService, this.searchQuery$));
      this.minDate = this.timeService.nowDate();
      //this.studentreport[0]['id'] = '1';
    }

  ngOnInit() {
      fromEvent(window, 'scroll').subscribe(() => {

      })
      disableBodyScroll(this.elRef.nativeElement);
    // this.activePassProvider = new ActivePassProvider(this.liveDataService, this.searchQuery$);
    this.http.globalReload$.subscribe(() => {
      this.getReports();
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

  onSearch(searchValue) {
      console.log('It emits here!', searchValue);
     this.searchQuery$.next(searchValue);
  }



  openDateDialog(event) {
    this.activeCalendar = true;
    const target = new ElementRef(event.currentTarget);
    const DR = this.dialog.open(CalendarComponent, {
        panelClass: 'calendar-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'trigger': target,
          'previousSelectedDate': this.reportsDate ? new Date(this.reportsDate) : null,
        }
    });
    DR.afterClosed()
      .subscribe((data) => {
        this.activeCalendar = false;

      console.log('82 Date ===> :', data.date);
        if (data.date) {
          this.inactiveIcon = data.date.getDay() === new Date().getDay();
          if ( !this.reportsDate || (this.reportsDate && this.reportsDate.getTime() !== data.date.getTime()) ) {
            this.reportsDate = new Date(data.date);
            console.log(this.reportsDate);
            this.getReports(this.reportsDate);
          }
        }
      }
    );
  }

  genOption(display, color, action) {
      return { display: display, color: color, action: action }
  }

  TooltipPlainText(evt: MouseEvent) {
      const target = new ElementRef(evt.currentTarget);
      let options = [];
      let header = '';

      header = 'This is simple plain text.';

      this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: { 'header': header, 'trigger': target }
      });
  }

  TooltipConfirmation(evt: MouseEvent) {
      const target = new ElementRef(evt.currentTarget);
      let options = [];
      let header = '';
      let ConsentText = '';
      let ConsentYesText = '';
      let ConsentNoText = '';
      let ConsentButtonColor = 'green';


      header = 'This is sample of Consent';
      ConsentText = 'Are you sure you want to do this process ?'
      ConsentYesText = 'Ok';
      ConsentNoText = 'No Thanks';


  const ConfirmationDialog = this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: { 'header': header, 'trigger': target, 'ConsentText': ConsentText, 'ConsentYesText': ConsentYesText, 'ConsentNoText': ConsentNoText, 'ConsentButtonColor': ConsentButtonColor}
      });


      ConfirmationDialog.afterClosed().subscribe(action => {
          if (action == 'doProcess') {
              alert('Process Perfomed Successfully');
          }
      });
  }


  TooltipOptions(evt: MouseEvent) {
      const target = new ElementRef(evt.currentTarget);
      let options = [];
      let header = '';



      header = 'This is sample of list options';

      options.push(this.genOption('Option 1', 'Orange', 'Opt1'));
      options.push(this.genOption('Option 2', 'Black', 'Opt2'));
      options.push(this.genOption('Option 3', 'Green', 'Opt3'));



      const OptionsDialog = this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: { 'header': header, 'trigger': target, 'options': options}
      });


      OptionsDialog.afterClosed().subscribe(action => {
          if (action == 'Opt1') {
              alert('Option1 Perfomed Successfully');
          }
          else if (action == 'Opt2') {
                  alert('Option2 Perfomed Successfully');
          }
          else if (action == 'Opt3') {
              alert('Option3 Perfomed Successfully');
          }
      });
  }

  Input1Validataion()
  {
      //Set your own logic as per requriement and return true or false vaule
      if (this.input_value1 == null || this.input_value1 == undefined || this.input_value1.length == 0)
      {
          return true;
      }
      else if (this.input_value1 == 'Bathroom' || this.input_value1 == 'Staffroom' || this.input_value1 == 'bathroom' || this.input_value1 == 'staffroom')
      {
          return true;
      }

      return false;
  }


  Input2Validataion() {
      //Set your own logic as per requriement and return true or false vaule
      if (this.input_value2 == null || this.input_value2 == undefined) {
          return null;
      }
      else if (this.input_value2 == 'BR' || this.input_value2 == 'AR' || this.input_value2 == 'br' || this.input_value2 == 'ar') {
          return true;
      }
      return false;
  }

  getChoiceValue(emit) {
      this.selectedtoggleValue = emit;
      console.log(emit);
  }
  private getReports(date?: Date) {
    const range = this.liveDataService.getDateRange(date);
    console.log(range);
    const response$ = date ?
        this.adminService.searchReports(range.end.toISOString(), range.start.toISOString()) :
        this.adminService.getReports();
    response$.pipe(
        map((list: any[]) => {
          return list.map((report, index) => {
            return {
              student_name: report.student.display_name + ` (${report.student.primary_email.split('@', 1)[0]})`,
              issuer: report.issuer.display_name,
              createdDate: Util.formatDateTime(new Date(report.created), false, false).split(', ')[0],
              created: Util.formatDateTime(new Date(report.created), false, false),
              message: report.message,
            };
          });

        }),
        switchMap((list: any[]) => {
          const groupedStudentreport: any[] = [];
          const temp = {
            date: null,
            reports: []
          };
          list.forEach((report, index) => {

            if (index < list.length) {
              temp.date = report.createdDate;
              temp.reports.push(report);

              if ( (index === list.length - 1) || report.createdDate !== list[index + 1].createdDate)  {
                groupedStudentreport.push(Object.assign({}, temp));
                temp.date = '';
                temp.reports = [];
                return;
              }
            }
          });
          return groupedStudentreport;
        }),
        toArray()
      )
      .subscribe((list: any[]) => {
        this.studentreport = list;
      });
  }
}
