import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-search-calendar',
  templateUrl: './search-calendar.component.html',
  styleUrls: ['./search-calendar.component.scss']
})
export class SearchCalendarComponent implements OnInit {

  triggerElementRef: HTMLElement;
  selectedDate;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public dialogRef: MatDialogRef<SearchCalendarComponent>
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.selectedDate = this.data['selectedDate'];
    this.updateDialogPosition();
  }

  updateDialogPosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left}px`, top: `${rect.bottom + 13}px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  result(date) {
    this.dialogRef.close(date);
  }

}
