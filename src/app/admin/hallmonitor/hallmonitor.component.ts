import { Component, OnInit, ElementRef} from '@angular/core';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { User } from '../../models/User';
import { Report } from '../../models/Report';
import { Pinnable } from '../../models/Pinnable';
import { ActivePassProvider } from '../../hall-monitor/hall-monitor.component';
import { LiveDataService } from '../../live-data/live-data.service';
import { PassLikeProvider } from '../../models/providers';
import {CalendarComponent} from '../calendar/calendar.component';
import {HttpService} from '../../http-service';
import {map} from 'rxjs/operators';


@Component({
  selector: 'app-hallmonitor',
  templateUrl: './hallmonitor.component.html',
  styleUrls: ['./hallmonitor.component.scss']
})
export class HallmonitorComponent implements OnInit {

    activePassProvider: PassLikeProvider;
    searchQuery$ = new BehaviorSubject('');
    minDate = new Date();
    input_value1: string;
    input_value2: string;
    input_DateRange: string;

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

    constructor(
        public dialog: MatDialog,
        private liveDataService: LiveDataService,
        private http: HttpService,

    ) {
      this.activePassProvider = new ActivePassProvider(this.liveDataService, this.searchQuery$);
      //this.studentreport[0]['id'] = '1';
    }

  ngOnInit() {
    this.activePassProvider = new ActivePassProvider(this.liveDataService, this.searchQuery$);
    this.getReports(this.minDate);
  }

  onSearch(searchValue) {
     this.searchQuery$.next(searchValue);
  }



  openDateDialog(event) {
    const target = new ElementRef(event.currentTarget);
    const DR = this.dialog.open(CalendarComponent, {
        panelClass: 'calendar-dialog-container',
        backdropClass: 'invis-backdrop',
        data: { 'trigger': target }
    });
    DR.afterClosed().subscribe((data) => {
        console.log('82 Date ===> :', data.date);
        this.getReports(data.date);
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

  TooltipConfirmation(evt: MouseEvent)
  {
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
  private getReports(date: Date) {
    const range = this.liveDataService.getDateRange(date);
    console.log(range);
    this.http.get(`v1/event_reports?created_before=${range.end.toISOString()}&created_after=${range.start.toISOString()}`)
    // this.http.get(`v1/event_reports`)
      .subscribe((list: Report[]) => {
        this.studentreport = list.map((report) => {
          return {
            student_name: report.student.display_name,
            issuer: report.issuer.display_name,
            created: report.created,
            message: report.message,
          };
        });
      });
  }
}
