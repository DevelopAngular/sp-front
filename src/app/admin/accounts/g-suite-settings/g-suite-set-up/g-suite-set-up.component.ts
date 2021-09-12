import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GSuiteOrgs} from '../../../../models/GSuiteOrgs';
import {Util} from '../../../../../Util';
import {BehaviorSubject, Observable} from 'rxjs';
import {CreateFormService} from '../../../../create-hallpass-forms/create-form.service';
import {AdminService} from '../../../../services/admin.service';

@Component({
  selector: 'app-g-suite-set-up',
  templateUrl: './g-suite-set-up.component.html',
  styleUrls: ['./g-suite-set-up.component.scss']
})
export class GSuiteSetUpComponent implements OnInit {

  @Input() gSuiteInfo: GSuiteOrgs;

  @Output() openEditMode: EventEmitter<any> = new EventEmitter<any>();
  @Output() back: EventEmitter<any> = new EventEmitter<any>();

  syncLoading$: Observable<boolean>;

  frameMotion$: BehaviorSubject<any>;

  constructor(
    private formService: CreateFormService,
    private adminService: AdminService
  ) { }

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  ngOnInit() {
    this.syncLoading$ = this.adminService.syncLoading$;
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  syncing() {
    this.adminService.gsuiteSyncNowRequest();
  }

}
