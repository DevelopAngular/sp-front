import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CreateFormService} from '../../../../create-hallpass-forms/create-form.service';

@Component({
  selector: 'app-g-suite-info',
  templateUrl: './g-suite-info.component.html',
  styleUrls: ['./g-suite-info.component.scss']
})
export class GSuiteInfoComponent implements OnInit {

  @Output() back: EventEmitter<any> = new EventEmitter<any>();

  frameMotion$: BehaviorSubject<any>;

  constructor(private formService: CreateFormService) { }

  get gradient() {
    return 'radial-gradient(circle at 73% 71%, #4274F6, #4274F6)';
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

}
