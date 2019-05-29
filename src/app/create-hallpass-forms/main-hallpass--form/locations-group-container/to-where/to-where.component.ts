import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import { Pinnable } from '../../../../models/Pinnable';
import { Navigation } from '../../main-hall-pass-form.component';
import { CreateFormService } from '../../../create-form.service';
import { States } from '../locations-group-container.component';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-to-where',
  templateUrl: './to-where.component.html',
  styleUrls: ['./to-where.component.scss']
})
export class ToWhereComponent implements OnInit {

  @Input() location;
  @Input() formState: Navigation;
  @Input() pinnables: Promise<Pinnable[]>;
  @Input() isStaff: boolean;
  @Input() date;
  @Input() studentText;

  @Output() selectedPinnable: EventEmitter<any> = new EventEmitter<any>();
  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  public states;

  public teacherRooms: Pinnable[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private formService: CreateFormService,

  ) {
    this.states = States;
  }

  ngOnInit() {
    this.location = this.formState.data.direction ? this.formState.data.direction.from : null;
    this.teacherRooms = this.formState.data.teacherRooms;
  }

  pinnableSelected(pinnable) {
    this.formService.setFrameMotionDirection('forward');
    setTimeout(() => {
      this.selectedPinnable.emit(pinnable);
    }, 100);
  }

  back() {
    this.formService.setFrameMotionDirection('back');
    setTimeout(() => {
      if (!!this.date &&
        !!this.studentText &&
        (this.formState.previousStep === 2 || this.formState.previousStep === 4)
      ) {
        this.formState.previousState = this.formState.state;
        this.formState.step = 1;
        this.formState.previousStep = 3;
      } else {
        this.formState.previousState = this.formState.state;
        if (this.formState.formMode.formFactor === 3 && this.formState.data.date.declinable) {
            this.formState.step = 1;
        } else {
          this.formState.state -= 1;
        }
      }
      this.formState.previousState = this.formState.state;

      //
      this.backButton.emit(this.formState);
    }, 100);
  }
}
