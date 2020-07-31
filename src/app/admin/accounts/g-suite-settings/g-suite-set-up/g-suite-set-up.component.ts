import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GSuiteOrgs} from '../../../../models/GSuiteOrgs';
import {Util} from '../../../../../Util';
import {BehaviorSubject} from 'rxjs';
import {CreateFormService} from '../../../../create-hallpass-forms/create-form.service';

@Component({
  selector: 'app-g-suite-set-up',
  templateUrl: './g-suite-set-up.component.html',
  styleUrls: ['./g-suite-set-up.component.scss']
})
export class GSuiteSetUpComponent implements OnInit {

  @Input() gSuiteInfo: GSuiteOrgs;

  @Output() openEditMode: EventEmitter<any> = new EventEmitter<any>();

  frameMotion$: BehaviorSubject<any>;

  constructor(private formService: CreateFormService) { }

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

}
