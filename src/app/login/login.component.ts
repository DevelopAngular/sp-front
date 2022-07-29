import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceDetection} from '../device-detection.helper';
import {GoogleLoginService} from '../services/google-login.service';
import {UserService} from '../services/user.service';
import {DomSanitizer, Meta, SafeUrl, Title} from '@angular/platform-browser';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {HttpService} from '../services/http-service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {StorageService} from '../services/storage.service';
import {User} from '../models/User';
import {Observable, ReplaySubject, Subject, zip} from 'rxjs';
import {INITIAL_LOCATION_PATHNAME} from '../app.component';
import {NotificationService} from '../services/notification-service';
import {environment} from '../../environments/environment.prod';
import {ScreenService} from '../services/screen.service';
import {LoginDataService} from '../services/login-data.service';

declare const window;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  @ViewChild('place') place: ElementRef;

  @Output() errorEvent: EventEmitter<any> = new EventEmitter();

  public appLink: string;
  public titleText: string;
  public trustedBackgroundUrl: SafeUrl;
  public pending$: Observable<boolean>;
  public formPosition: string = '70px';

  private pendingSubject = new ReplaySubject<boolean>(1);
  private isIOSMobile: boolean = DeviceDetection.isIOSMobile();
  private isAndroid: boolean = DeviceDetection.isAndroid();
  private jwt: JwtHelperService;
  private destroyer$ = new Subject<any>();

  constructor(
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
    public screen: ScreenService,
    private loginDataService: LoginDataService
  ) {
    this.jwt = new JwtHelperService();
    this.pending$ = this.pendingSubject.asObservable();
  }

  get isMobileDevice() {
    return this.isAndroid || this.isIOSMobile;
  }

  ngOnInit() {
    window.Intercom('update', {'hide_default_launcher': true});
    this.titleService.setTitle('SmartPass Sign-in');
    this.metaService.addTag({
      name: 'description',
      content: 'Digital hall pass system and school safety solution. Sign-in with your school account. Don\'t have an account? Schedule a free demo to see how SmartPass can make your school safer and control the flow of students.'
    });

    setTimeout(() => {
      window.appLoaded();
    }, 700);

    this.loginService.isAuthenticated$.pipe(
      filter(v => v),
      switchMap((v): Observable<[User, Array<string>]> => {
        return zip(
          this.userService.userData.asObservable().pipe(filter(user => !!user)),
          INITIAL_LOCATION_PATHNAME.asObservable().pipe(map(p => p.split('/').filter(v => v && v !== 'app')))
        );
      }),
      takeUntil(this.destroyer$)
    ).subscribe(([currentUser, path]) => {
      if (NotificationService.hasPermission && environment.production) {
        this.notifService.initNotifications(true);
      }

      const callbackUrl: string = window.history.state.callbackUrl;

      if (callbackUrl != null) {
        this.router.navigate([callbackUrl]);
      } else if (this.isMobileDevice && currentUser.isAdmin() && currentUser.isTeacher()) {
        this.router.navigate(['main']);
      } else {
        const loadView = currentUser.isAdmin() ? 'admin' : 'main';
        this.router.navigate([loadView]);
      }
      this.titleService.setTitle('SmartPass');
    });

    this.trustedBackgroundUrl = this.sanitizer.bypassSecurityTrustStyle('url(\'./assets/Login Background.svg\')');

    if (this.isIOSMobile) {
      this.appLink = 'https://itunes.apple.com/us/app/smartpass-mobile/id1387337686?mt=8';
      this.titleText = 'Download SmartPass on the App Store to start making passes.';
    } else if (this.isAndroid) {
      this.appLink = 'https://play.google.com/store/apps/details?id=app.smartpass.smartpass';
      this.titleText = 'Download SmartPass on the Google Play Store to start making passes.';
    }

    this.route.queryParams.pipe(
      filter((queryParams) => {
        return queryParams.email || queryParams.school_id || queryParams.instant_login;
      }),
      takeUntil(this.destroyer$),
    ).subscribe((qp) => {
      this.loginDataService.setLoginDataQueryParams(
        { email: qp.email, school_id: qp.school_id, instant_login: qp.instant_login }
      );
    });
  }

  ngOnDestroy() {
    this.destroyer$.next(null);
    this.destroyer$.complete();
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
