import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CreateFormService} from '../../../create-form.service';
import {MatDialogRef} from '@angular/material';
import {Navigation} from '../../main-hall-pass-form.component';

@Component({
  selector: 'app-who-you-are',
  templateUrl: './who-you-are.component.html',
  styleUrls: ['./who-you-are.component.scss']
})
export class WhoYouAreComponent implements OnInit {

  @Input() formState: Navigation;
  @Output() stateChangeEvent: EventEmitter<Navigation> = new EventEmitter();

  constructor(
    private dialogRef: MatDialogRef<WhoYouAreComponent>,
    private formService: CreateFormService
  ) { }

  ngOnInit(

  ) {
  }
  setSelectedStudents(evt) {
    if (this.formState.forLater) {
      this.formState.step = 1;
      this.formState.fromState = 1;
    } else {
      this.formState.step = 3;
      this.formState.state = 2;
      this.formState.fromState = 1;
    }

      this.formState.data.selectedStudents = evt;

    this.stateChangeEvent.emit(this.formState);
  }
  back() {
    this.dialogRef.close();
  }
}
