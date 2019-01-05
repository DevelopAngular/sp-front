import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleLoginService } from '../google-login.service';
import {DeviceDetection} from '../device-detection.helper';

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

  constructor(private loginService: GoogleLoginService, private router: Router, private _zone: NgZone) {

    // this code does not appear to be required and it messes with routing for the intro page. (2019-01-05)

    // this.loginService.isAuthenticated$
    //   .filter(v => v)
    //   .take(1)
    //   .subscribe(value => {
    //     this._zone.run(() => {
    //       this.router.navigate(['main/passes']);
    //     });
    //   });

  }

  ngOnInit() {
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
