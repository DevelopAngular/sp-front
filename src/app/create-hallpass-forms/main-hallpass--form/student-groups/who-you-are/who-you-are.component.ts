import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CreateFormService} from '../../../create-form.service';
import {MatDialogRef} from '@angular/material/dialog';
import {Navigation} from '../../main-hall-pass-form.component';
import {ScreenService} from '../../../../services/screen.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-who-you-are',
  templateUrl: './who-you-are.component.html',
  styleUrls: ['./who-you-are.component.scss']
})
export class WhoYouAreComponent implements OnInit {

  @Input() formState: Navigation;
  @Output() stateChangeEvent: EventEmitter<Navigation> = new EventEmitter();

  frameMotion$: BehaviorSubject<any>;

  constructor(
    private dialogRef: MatDialogRef<WhoYouAreComponent>,
    private formService: CreateFormService,
    private screenService: ScreenService,
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  setSelectedStudents(evt) {

    this.formService.setFrameMotionDirection('forward');
    this.formService.compressableBoxController.next(false);

    setTimeout(() => {
    //   debugger

      if (this.formState.forLater) {
        this.formState.step = 1;
        this.formState.fromState = 1;
      } else {
        this.formState.step = 3;
        this.formState.state = 2;
        this.formState.fromState = 4;
      }

      this.formState.data.selectedStudents = evt;

      this.stateChangeEvent.emit(this.formState);
    }, 100);
  }
  back() {
    this.dialogRef.close();
  }
}
