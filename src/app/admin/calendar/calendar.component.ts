import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  triggerElementRef: ElementRef;
  minDate: Date = new Date('December 17, 1995 03:24:00');

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any[],
      private _matDialogRef: MatDialogRef<CalendarComponent>
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];

      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
      matDialogConfig.position = { left: `${rect.left - 200}px`, top: `${rect.bottom + 15}px` };
      this._matDialogRef.updatePosition(matDialogConfig.position);
  }

  setSearchDate(date) {
     console.log(date);
  }

}