import {AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetection } from '../device-detection.helper';
import { GoogleLoginService } from '../services/google-login.service';
import { UserService } from '../services/user.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import {HttpService} from '../services/http-service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {GoogleAuthService} from '../services/google-auth.service';
import {StorageService} from '../services/storage.service';
import {User} from '../models/User';
import {ReplaySubject, Subject} from 'rxjs';

declare const window;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('place') place: ElementRef;

  @Output() errorEvent: EventEmitter<any> = new EventEmitter();

  public appLink: string;
  public titleText: string;
  public isMobileDevice: boolean = false;
  public trustedBackgroundUrl: SafeUrl;
  public showError = { loggedWith: null, error: null };

  private isIOSMobile: boolean = DeviceDetection.isIOSMobile();
  private isAndroid: boolean = DeviceDetection.isAndroid();
  private jwt: JwtHelperService;
  private destroyer$ = new Subject<any>();

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
      // filter(v => v),
      switchMap((): ReplaySubject<User> => {
        return this.userService.userData;
      }),
      takeUntil(this.destroyer$)
    ).subscribe((currentUser: User) => {
      const loadView = [currentUser.isAdmin() ? 'admin' : 'main'];
      this.router.navigate(loadView);
    });

    this.trustedBackgroundUrl = this.sanitizer.bypassSecurityTrustStyle('url(\'./assets/Login Background.svg\')');

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
  ngOnDestroy() {
    this.destroyer$.next(null);
    this.destroyer$.complete();
  }
}
