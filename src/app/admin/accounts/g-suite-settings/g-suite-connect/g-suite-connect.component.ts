import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CreateFormService} from '../../../../create-hallpass-forms/create-form.service';
import {AdminService} from '../../../../services/admin.service';
import {BehaviorSubject} from 'rxjs';

declare const window;

@Component({
  selector: 'app-g-suite-connect',
  templateUrl: './g-suite-connect.component.html',
  styleUrls: ['./g-suite-connect.component.scss']
})
export class GSuiteConnectComponent implements OnInit {

  frameMotion$: BehaviorSubject<any>;
  @Output() back: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private formService: CreateFormService,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  getAuthorizeLink() {
    this.adminService.getGSuiteAuthorizeLink().subscribe(({authorization_link}) => {
      window.open(authorization_link, '_self');
    });
  }

  openOnboardingGuide() {
    window.open('https://www.smartpass.app/support/onboarding-guide', '_blank').focus();
  }

}
