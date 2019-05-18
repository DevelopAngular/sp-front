import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {EMPTY, of} from 'rxjs';
import {delay} from 'rxjs/operators';

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
  close(evt: Event) {
    // this.dialogRef.close();
    evt.stopPropagation();
    this.toggleToast = false;
    of(null).pipe(
      delay(1000)
    ).subscribe(() => {
      this.closeEvent.emit(false);
    });
  }
}
