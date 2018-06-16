import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-request-accept',
  templateUrl: './request-accept.component.html',
  styleUrls: ['./request-accept.component.css']
})

export class RequestAcceptComponent implements OnInit {

  @Output() onAccept: EventEmitter<any> = new EventEmitter();

  formState = 1;

  selectedGradient = '#03cf31, #018155';
  deselectedGradient = '#979797, #979797';

  nowGradient = this.selectedGradient;
  laterGradient = this.deselectedGradient;

  showDate: boolean = false;

  date: string = '';
  duration: number;

  constructor(public dialogRef: MatDialogRef<RequestAcceptComponent>) {
  }

  ngOnInit() {

  }

  setMoment(moment: String) {
    if (moment == 'now') {
      this.nowGradient = this.selectedGradient;
      this.laterGradient = this.deselectedGradient;
      this.showDate = false;
      this.date = '';
    } else {
      this.nowGradient = this.deselectedGradient;
      this.laterGradient = this.selectedGradient;
      this.showDate = true;
    }
  }

  updateDate(date: string) {
    this.date = date;
    // console.log('[Date]: ', this.date);
  }

  updateDuration(duration: number) {
    this.duration = duration;
  }

  acceptRequest() {
    if (this.showDate && this.date == '') {
      //TODO add some sort of error message
    } else {
      let params = {
        'date': this.date,
        'duration': this.duration
      };
      this.dialogRef.close(params);
    }
  }
}
