import {AfterViewInit, Component, EventEmitter, NgZone, OnInit, Output} from '@angular/core';
import { environment } from '../../environments/environment';
import {constructUrl, QueryParams} from '../live-data/helpers';
import {
  catchError,
  debounceTime,
  delay,
  distinctUntilChanged,
  map,
  pluck,
  switchMap,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';
import {BehaviorSubject, Observable, Subject, throwError} from 'rxjs';
import {GoogleAuthService} from '../services/google-auth.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HttpService} from '../services/http-service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {GoogleLoginService} from '../services/google-login.service';
import {UserService} from '../services/user.service';
import {StorageService} from '../services/storage.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {GettingStartedProgressService} from '../admin/getting-started-progress.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';
import {DarkThemeSwitch} from '../dark-theme-switch';

declare const window;

export const INVALID_DOMAINS = [
  /* Default domains included */
  'aol.com', 'att.net', 'comcast.net', 'facebook.com', 'gmail.com', 'gmx.com', 'googlemail.com',
  'google.com', 'hotmail.com', 'hotmail.co.uk', 'mac.com', 'me.com', 'mail.com', 'msn.com',
  'live.com', 'sbcglobal.net', 'verizon.net', 'yahoo.com', 'yahoo.co.uk',

  /* Other global domains */
  'email.com', 'fastmail.fm', 'games.com' /* AOL */, 'gmx.net', 'hush.com', 'hushmail.com', 'icloud.com',
  'iname.com', 'inbox.com', 'lavabit.com', 'love.com' /* AOL */, 'outlook.com', 'pobox.com', 'protonmail.ch', 'protonmail.com', 'tutanota.de', 'tutanota.com', 'tutamail.com', 'tuta.io',
  'keemail.me', 'rocketmail.com' /* Yahoo */, 'safe-mail.net', 'wow.com' /* AOL */, 'ygm.com' /* AOL */,
  'ymail.com' /* Yahoo */, 'zoho.com', 'yandex.com',

  /* United States ISP domains */
  'bellsouth.net', 'charter.net', 'cox.net', 'earthlink.net', 'juno.com',

  /* British ISP domains */
  'btinternet.com', 'virginmedia.com', 'blueyonder.co.uk', 'freeserve.co.uk', 'live.co.uk',
  'ntlworld.com', 'o2.co.uk', 'orange.net', 'sky.com', 'talktalk.co.uk', 'tiscali.co.uk',
  'virgin.net', 'wanadoo.co.uk', 'bt.com',

  /* Domains used in Asia */
  'sina.com', 'sina.cn', 'qq.com', 'naver.com', 'hanmail.net', 'daum.net', 'nate.com', 'yahoo.co.jp', 'yahoo.co.kr', 'yahoo.co.id', 'yahoo.co.in', 'yahoo.com.sg', 'yahoo.com.ph', '163.com', 'yeah.net', '126.com', '21cn.com', 'aliyun.com', 'foxmail.com',

  /* French ISP domains */
  'hotmail.fr', 'live.fr', 'laposte.net', 'yahoo.fr', 'wanadoo.fr', 'orange.fr', 'gmx.fr', 'sfr.fr', 'neuf.fr', 'free.fr',

  /* German ISP domains */
  'gmx.de', 'hotmail.de', 'live.de', 'online.de', 't-online.de' /* T-Mobile */, 'web.de', 'yahoo.de',

  /* Italian ISP domains */
  'libero.it', 'virgilio.it', 'hotmail.it', 'aol.it', 'tiscali.it', 'alice.it', 'live.it', 'yahoo.it', 'email.it', 'tin.it', 'poste.it', 'teletu.it',

  /* Russian ISP domains */
  'mail.ru', 'rambler.ru', 'yandex.ru', 'ya.ru', 'list.ru',

  /* Belgian ISP domains */
  'hotmail.be', 'live.be', 'skynet.be', 'voo.be', 'tvcablenet.be', 'telenet.be',

  /* Argentinian ISP domains */
  'hotmail.com.ar', 'live.com.ar', 'yahoo.com.ar', 'fibertel.com.ar', 'speedy.com.ar', 'arnet.com.ar',

  /* Domains used in Mexico */
  'yahoo.com.mx', 'live.com.mx', 'hotmail.es', 'hotmail.com.mx', 'prodigy.net.mx',

  /* Domains used in Canada */
  'yahoo.ca', 'hotmail.ca', 'bell.net', 'shaw.ca', 'sympatico.ca', 'rogers.com',

  /* Domains used in Brazil */
  'yahoo.com.br', 'hotmail.com.br', 'outlook.com.br', 'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br', 'itelefonica.com.br', 'r7.com', 'zipmail.com.br', 'globo.com', 'globomail.com', 'oi.com.br'
];

@Component({
  selector: 'app-school-sign-up',
  templateUrl: './school-sign-up.component.html',
  styleUrls: ['./school-sign-up.component.scss']
})
export class SchoolSignUpComponent implements OnInit, AfterViewInit {

  @Output() schoolCreatedEvent: EventEmitter<boolean> = new EventEmitter();

  private pending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private AuthToken: string;
  private jwt: JwtHelperService;
  private destroy$ = new Subject<any>();


  public trustedBackgroundUrl: SafeUrl;
  public pending$: Observable<boolean> = this.pending.asObservable();

  public showError = { loggedWith: null, error: null };
  public school: any;
  public errorToast;
  public schoolForm: FormGroup;
  public enterSchoolName: boolean = true;
  public inputIndex = 0;


  constructor(
    private googleAuth: GoogleAuthService,
    private http: HttpClient,
    private httpService: HttpService,
    private userService: UserService,
    private loginService: GoogleLoginService,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private _zone: NgZone,
    private gsProgress: GettingStartedProgressService,
    private fb: FormBuilder,
    private shortcutsService: KeyboardShortcutsService,
  ) {
    this.jwt = new JwtHelperService();
    this.errorToast = this.httpService.errorToast$;
    this.trustedBackgroundUrl = this.sanitizer.bypassSecurityTrustStyle('url(\'./assets/Signup Background.svg\')');
    window.appLoaded(0);
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(
        switchMap((qp: QueryParams) => {
          this.AuthToken = qp.key as string;
          return this.http.get(environment.schoolOnboardApiRoot + `/onboard/schools/check_auth`, {
            headers: new HttpHeaders({
              'Authorization': 'Bearer ' + this.AuthToken
            })
          }).pipe(
            catchError((err) => {
              if (err.status === 401) {
                this.httpService.errorToast$.next({
                  header: 'Key invalid.',
                  message: 'Please contact us at support@smartpass.app'
                });
              }
              this.pending.next(false);
              return throwError(err);
            })
          );
        })
      )
      .subscribe((qp) => {
      console.log(this.AuthToken);
    });

    this.schoolForm = new FormGroup({
      google_place_id: new FormControl('', Validators.required),
      full_name: new FormControl('', Validators.required),
      email: new FormControl('',
        [
        Validators.required,
        // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9]+.[a-zA-Z0-9]+$'),
          Validators.email,
        (fc: FormControl) => {
          return  fc.value.indexOf('@') >= 0 && INVALID_DOMAINS.includes(fc.value.slice(fc.value.indexOf('@') + 1).toLowerCase()) ? {invalid_email: true}  : null;
        }
      ], [
          this.checkEmailValidatorAsync.bind(this)
      ]),
      password: new FormControl('',
        [
        Validators.required,
        Validators.minLength(8)
      ])
    });
    this.schoolForm.markAsTouched();

    this.shortcutsService.onPressKeyEvent$
      .pipe(
        tap((s) => {
          s.event.preventDefault();
          // console.log(e);
        }),
        pluck('key'),
        takeUntil(this.destroy$)
      )
      .subscribe(key => {
        if (key[0] === 'tab') {
            this.inputIndex = this.inputIndex === 3 ? 0 : this.inputIndex + 1;
        }
      });
  }
  ngAfterViewInit() {
    window.appLoaded();
  }

  checkEmailValidatorAsync(control: FormControl) {
    return control.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(400),
        take(1),
        switchMap((value) => {
          return this.http
            .get(constructUrl(environment.schoolOnboardApiRoot + '/onboard/schools/check_email', {email: value}), {
              headers: new HttpHeaders({
                'Authorization': 'Bearer ' + this.AuthToken
              })
            }).pipe(
              take(1),
              map(({exists}: {exists: boolean}) => {
                return (exists ? { uniqEmail: true } : null);
              })
            );
        })
      );
  }

  initLogin() {
    return this.loginService.GoogleOauth.signIn()
      .then((auth) => {
        console.log(auth);
        return auth.getAuthResponse();
      });

  }
  createSchool() {
    window.waitForAppLoaded(true);
    this.pending.next(true);
    this.gsProgress.updateProgress('create_school:start');
          this.http.post(environment.schoolOnboardApiRoot + '/onboard/schools', {
            // user_token: auth.id_token,
            // google_place_id: this.school.place_id,
            ...this.schoolForm.value
          }, {
            headers: new HttpHeaders({
              'Authorization': 'Bearer ' + this.AuthToken
            })
          }).pipe(
            // tap(() => this.gsProgress.updateProgress('create_school:end')),
            map((res: any) => {
              this._zone.run(() => {
                console.log('Sign in start ===>>>>>');
                this.loginService.signInDemoMode(this.schoolForm.value.email, this.schoolForm.value.password);
                this.storage.setItem('last_school_id', res.school.id);
              });
              return true;
            }),
            switchMap(() => {
              return this.loginService.isAuthenticated$;
            }),
            delay(500),
            catchError((err) => {
              console.log('Error ======>>>>>');
              if (err && err.error !== 'popup_closed_by_user') {
                this.loginService.showLoginError$.next(true);
              }
              this.pending.next(false);
              return throwError(err);
            })
          )
          .subscribe((res) => {
            console.log('Sign in end ===>>>>>', res);
            this.pending.next(false);
            if (res) {
              this._zone.run(() => {
                this.router.navigate(['admin', 'dashboard']);
              });
            }
          });
  }

  onBlur () {
    if (!this.pending.value) {
      this.enterSchoolName = false;
    }
  }

  checkSchool(school: any) {
    if (school) {
      this.pending.next(true);
      this.http.get(constructUrl(environment.schoolOnboardApiRoot + '/onboard/schools/check_school', {place_id: school.place_id}), {
        headers: {
          'Authorization': 'Bearer ' + this.AuthToken
        }})
        .pipe(
          catchError((err) => {
            if (err.status === 401) {
              this.httpService.errorToast$.next({
                header: 'Key invalid.',
                message: 'Please contact us at support@smartpass.app'
              });
            }
            this.pending.next(false);
            return throwError(err);
          })
        )
        .subscribe((onboard: any) => {
          if (onboard.school_registered) {
            this.httpService.schoolSignInRegisterText$.next('Your school is already signed up!');
            this.goHome();
          } else {
            this.school = school;
            this.schoolForm.controls.google_place_id.setValue( this.school.place_id);
            this.enterSchoolName = false;
            this.inputIndex = 1;
          }
          this.pending.next(false);

        });
    } else {
      if (this.school) {
        this.enterSchoolName = false;
      }
    }
  }

  openLink(link) {
    window.open(link);
  }

  goHome() {
    this.router.navigate(['']);
  }

}
