import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-error-toast',
  templateUrl: './error-toast.component.html',
  styleUrls: ['./error-toast.component.scss']
})
export class ErrorToastComponent implements OnInit {

  @Input() loginMethod: number;

  @Output() closeEvent = new EventEmitter<boolean>();

  public errorMessages = {
    1: 'Please sign in with your school account or contact your school administrator.',
    2: 'Please check your username and password or contact your school administrator',
  }
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
