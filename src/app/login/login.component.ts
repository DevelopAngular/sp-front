import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetection } from '../device-detection.helper';
import { GoogleLoginService } from '../google-login.service';
import { UserService } from '../user.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  private isIOSMobile: boolean;
  private isAndroid: boolean;
  public appLink: string;
  public titleText: string;
  public isMobileDevice: boolean = false;
  public trustedBackgroundUrl: SafeUrl;

  constructor(private userService: UserService, private loginService: GoogleLoginService, private router: Router, private sanitizer: DomSanitizer, private _zone: NgZone) {

  }

  ngOnInit() {
    this.trustedBackgroundUrl = this.sanitizer.bypassSecurityTrustStyle('url(\'./assets/Login Background.svg\')');

    this.isIOSMobile = DeviceDetection.isIOSMobile();
    this.isAndroid = DeviceDetection.isAndroid();

    if (this.isIOSMobile) {
      this.isMobileDevice = true;
      this.appLink = 'https://itunes.apple.com/us/app/smartpass-mobile/id1387337686?mt=8';
      this.titleText = 'Download SmartPass on the App Store to start making passes.';
    } else if (this.isAndroid) {
      this.isMobileDevice = true;
      this.appLink = 'https://play.google.com/store/apps/details?id=app.smartpass.smartpass';
      this.titleText = 'Download SmartPass on the Google Play Store to start making passes.';
    }
  }

}
