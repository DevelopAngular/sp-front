import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-error-toast',
  templateUrl: './error-toast.component.html',
  styleUrls: ['./error-toast.component.scss']
})
export class ErrorToastComponent implements OnInit {

  @Output() closeEvent = new EventEmitter<boolean>();
  public toggleToast: boolean;
  constructor(
    // private dialogRef: MatDialogRef<ErrorToastComponent>
  ) { }

  ngOnInit() {
    setTimeout(() => { this.toggleToast = true; }, 250);
  }
  close() {
    // this.dialogRef.close();
    this.toggleToast = false;
    this.closeEvent.emit(false);
  }
}
