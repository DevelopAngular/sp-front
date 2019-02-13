import {ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import { Pinnable } from '../../../../models/Pinnable';
import { Navigation } from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';
import {BehaviorSubject} from 'rxjs';
import {BodyShowingUp, HeaderShowingUp, NextStep} from '../../../../animations';

@Component({
  selector: 'app-to-where',
  templateUrl: './to-where.component.html',
  styleUrls: ['./to-where.component.scss'],
  animations: [HeaderShowingUp, BodyShowingUp, NextStep]

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

  animatedComponetVisibility: boolean = true;

  isDisabled: boolean = false;

  frameMotion$: BehaviorSubject<any>;

  constructor(
    private formService: CreateFormService,
    private _zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();

    this.location = this.formState.data.direction ? this.formState.data.direction.from : null;
  }

  pinnableSelected(pinnable) {

    // this._zone.run(() => {
      this.formService.setFrameMotionDirection('forward');
      this.animatedComponetVisibility = false;
      this.changeDetectorRef.detectChanges();

    // })

    setTimeout(() => {
      this.selectedPinnable.emit(pinnable);

    }, 250);


  }

  back() {
    // this._zone.run(() => {
      this.formService.setFrameMotionDirection('back');
      this.animatedComponetVisibility = false;
      this.changeDetectorRef.detectChanges();
    // })

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
      //
      this.backButton.emit(this.formState);
    }, 250);


  }

}
