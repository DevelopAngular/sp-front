import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DeviceDetection } from '../device-detection.helper';

declare const window;

@Component({
  selector: 'app-parent-sign-up',
  templateUrl: './parent-sign-up.component.html',
  styleUrls: ['./parent-sign-up.component.scss']
})
export class ParentSignUpComponent implements OnInit {

  public signUpForm: FormGroup;
  public trustedBackgroundUrl: SafeUrl;
  public formPosition: string = '20px';
  public loginData = {
    demoLoginEnabled: false,
    demoUsername: '',
    demoPassword: '',
    authType: '',
  };

  private isIOSMobile: boolean = DeviceDetection.isIOSMobile();
  private isAndroid: boolean = DeviceDetection.isAndroid();

  constructor(
    private sanitizer: DomSanitizer,
  ) { 
    this.trustedBackgroundUrl = this.sanitizer.bypassSecurityTrustStyle('url(\'./assets/Signup Background.svg\')');
  }

  get isMobileDevice() {
    return this.isAndroid || this.isIOSMobile;
  }

  ngOnInit(): void {
    window.appLoaded();

    this.signUpForm = new FormGroup({
      name: new FormControl(),
      email: new FormControl(),
      password: new FormControl()
    });
  }

  formMobileUpdatePosition() {
    if (this.isMobileDevice) {
      this.formPosition = '-25px';
    }
  }

  /*Scroll hack for ios safari*/

  preventTouch($event) {
    $event.preventDefault();
  }

}
