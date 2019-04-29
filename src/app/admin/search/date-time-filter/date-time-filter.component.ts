import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-date-time-filter',
  templateUrl: './date-time-filter.component.html',
  styleUrls: ['./date-time-filter.component.scss']
})
export class DateTimeFilterComponent implements OnInit {

  targetElementRef: ElementRef;

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any[],
      private _matDialogRef: MatDialogRef<DateTimeFilterComponent>) { }

  ngOnInit() {
    this.targetElementRef = this.data['target'];
    this.updateCalendarPosition();
  }

  updateCalendarPosition() {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect = this.targetElementRef.nativeElement.getBoundingClientRect();

      matDialogConfig.position = { left: `${rect.left - 100}px`, top: `${rect.bottom + 15}px` };

      this._matDialogRef.updatePosition(matDialogConfig.position);
  }

}
