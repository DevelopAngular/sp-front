import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GSuiteOrgs} from '../../../../models/GSuiteOrgs';
import {Util} from '../../../../../Util';

@Component({
  selector: 'app-g-suite-set-up',
  templateUrl: './g-suite-set-up.component.html',
  styleUrls: ['./g-suite-set-up.component.scss']
})
export class GSuiteSetUpComponent implements OnInit {

  @Input() gSuiteInfo: GSuiteOrgs;

  @Output() openEditMode: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  ngOnInit() {
  }

}
