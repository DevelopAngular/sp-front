import {AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { DeviceDetection } from '../device-detection.helper';
import { GoogleLoginService } from '../services/google-login.service';
import { UserService } from '../services/user.service';
import {DomSanitizer, Meta, SafeUrl, Title} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {HttpService} from '../services/http-service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {GoogleAuthService} from '../services/google-auth.service';
import {StorageService} from '../services/storage.service';
import {User} from '../models/User';
import {Observable, ReplaySubject, Subject, zip} from 'rxjs';
import {INITIAL_LOCATION_PATHNAME} from '../app.component';
import {NotificationService} from '../services/notification-service';
import {environment} from '../../environments/environment.prod';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {ScreenService} from '../services/screen.service';

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
  public isMobileDevice = false;
  public trustedBackgroundUrl: SafeUrl;
  public pending$: Observable<boolean>;

  private pendingSubject = new ReplaySubject<boolean>(1);
  private isIOSMobile: boolean = DeviceDetection.isIOSMobile();
  private isAndroid: boolean = DeviceDetection.isAndroid();
  private jwt: JwtHelperService;
  private destroyer$ = new Subject<any>();

  constructor(
    private googleAuth: GoogleAuthService,
    private httpService: HttpService,
    private userService: UserService,
    private loginService: GoogleLoginService,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    private metaService: Meta,
    private notifService: NotificationService,
    private darkSwitch: DarkThemeSwitch,
    public screen: ScreenService
  ) {
    this.jwt = new JwtHelperService();
    this.pending$ = this.pendingSubject.asObservable();
  }

  ngOnInit() {
    this.darkSwitch.switchTheme('Light');

    this.titleService.setTitle('SmartPass Sign-in');
    this.metaService.addTag({
      name: 'description',
      content: 'Digital hall pass system and school safety solution. Sign-in with your school account. Don\'t have an account? Sign your school up for a free 60 day trial.'
    });

    if (this.isIOSMobile || this.isAndroid) {
      window.waitForAppLoaded();
    }

    this.loginService.isAuthenticated$.pipe(
      filter(v => v),
      switchMap((v): Observable<[User, Array<string>]> => {
        return zip(
          this.userService.userData.asObservable(),
          INITIAL_LOCATION_PATHNAME.asObservable().pipe(map(p => p.split('/').filter(v => v && v !== 'app')))
        );
      }),
      takeUntil(this.destroyer$)
    ).subscribe(([currentUser, path]) => {

      if (NotificationService.hasPermission && environment.production) {
        this.notifService.initNotifications(true);
      }

      // console.log(path);

      const loadView = currentUser.isAdmin() ? 'admin' : 'main';

      // if (path.length) {
      //   this.router.navigate(path);
      // } else {
        this.router.navigate([loadView]);
      // }
      this.titleService.setTitle('SmartPass');
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
    // if (this.isIOSMobile || this.isAndroid) {
      window.appLoaded();
    // }
  }

  ngOnDestroy() {
    this.destroyer$.next(null);
    this.destroyer$.complete();
  }

  /*Scroll hack for ios safari*/

  preventTouch($event) {
    $event.preventDefault();
  }
}
