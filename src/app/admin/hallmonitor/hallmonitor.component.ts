﻿import { Component, OnInit, ElementRef} from '@angular/core';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
import { MatDialogRef, MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Util } from '../../../Util';


@Component({
  selector: 'app-hallmonitor',
  templateUrl: './hallmonitor.component.html',
  styleUrls: ['./hallmonitor.component.scss']
})
export class HallmonitorComponent implements OnInit {
    input_value1: string;
    input_value2: string;

    min: Date = new Date('December 17, 1995 03:24:00');
    calendarToggled = false;
    searchDate$ = new BehaviorSubject<Date>(null);

    calendarToggled_2nd = false;
    searchDate_1st$ = new BehaviorSubject<Date>(null);
    searchDate_2nd$ = new BehaviorSubject<Date>(null);

    constructor(
        public dialog: MatDialog
        
    ) { 
        this.setSearchDate(new Date());
        this.setSearchDate_1st(new Date());
        this.setSearchDate_2nd(new Date());
    }

  ngOnInit() {
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
      if (this.input_value1 == null || this.input_value1 == undefined)
      {
          return null;
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

  setSearchDate(date: Date) {
      if (date != null || date != undefined) {
          date.setHours(0);
          date.setMinutes(0);
          this.searchDate$.next(date);
      }
  }
  get searchDate() {
      return this.searchDate$.value;
  }

  get dateDisplay() {

      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return this.searchDate.toLocaleDateString("en-US", options)
      //return Util.formatDateTime(this.searchDate);
  }

  setSearchDate_1st(date: Date) {
      if (date != null || date != undefined) {
          //date.setHours(0);
          //date.setMinutes(0);
          this.searchDate_1st$.next(date);
      }
  }
  get searchDate_1st() {
      return this.searchDate_1st$.value;
  }

  get getDisplayRange() {

      return Util.formatDateTimeForDateRange(this.searchDate_1st, this.searchDate_2nd);
      //return this.searchDate_1st;
  }




setSearchDate_2nd(date: Date) {
      if (date != null || date != undefined) {
          //date.setHours(0);
          //date.setMinutes(0);
          this.searchDate_2nd$.next(date);
      }
  }
  get searchDate_2nd() {
      return this.searchDate_2nd$.value;
  }

  get dateDisplay_2nd() {
      return this.searchDate_2nd;
  }
}