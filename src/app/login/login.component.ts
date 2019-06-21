import {AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetection } from '../device-detection.helper';
import { GoogleLoginService } from '../services/google-login.service';
import { UserService } from '../services/user.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {catchError, filter, flatMap, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {AuthContext, HttpService} from '../services/http-service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {GoogleAuthService} from '../services/google-auth.service';
import {StorageService} from '../services/storage.service';
import {User} from '../models/User';
import {ReplaySubject} from 'rxjs';

declare const window;

export type LoginState = 'school' | 'profile';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  @ViewChild('place') place: ElementRef;
  @Output() errorEvent: EventEmitter<any> = new EventEmitter();

  private isIOSMobile: boolean;
  private isAndroid: boolean;
  public appLink: string;
  public titleText: string;
  public isMobileDevice: boolean = false;
  public trustedBackgroundUrl: SafeUrl;
  public showError = { loggedWith: null, error: null };
  public loginState: LoginState = 'profile';
  private jwt: JwtHelperService;


  constructor(
    private googleAuth: GoogleAuthService,
    private http: HttpClient,
    private httpService: HttpService,
    private googleLogin: GoogleLoginService,
    private userService: UserService,
    private loginService: GoogleLoginService,
    private storage: StorageService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {
    this.jwt = new JwtHelperService();
  }

  ngOnInit() {

    this.loginService.isAuthenticated$.pipe(
      filter(v => v),
      switchMap((): ReplaySubject<User> => {
        return this.userService.userData;
      })
    ).subscribe((currentUser: User) => {
      const loadView = [currentUser.isAdmin() ? 'admin' : 'main'];
      this.router.navigate(loadView);
    });

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
  ngAfterViewInit() {
    window.appLoaded();
  }
  onClose(evt) {
    setTimeout(() => {
      this.loginService.showLoginError$.next(false);
      this.showError.error = evt;
      this.loginState = 'profile';
    }, 400);
  }
  onError() {
    this.router.navigate(['error']);
  }
}
