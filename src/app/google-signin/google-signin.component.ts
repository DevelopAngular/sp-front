import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {GoogleLoginService} from '../services/google-login.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {filter, finalize, pluck, takeUntil, tap} from 'rxjs/operators';
import {HttpService} from '../services/http-service';
import {DomSanitizer, Meta, Title} from '@angular/platform-browser';
import {environment} from '../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {HttpClient} from '@angular/common/http';
import {FormControl, FormGroup} from '@angular/forms';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';
import {QueryParams} from '../live-data/helpers';
import {StorageService} from '../services/storage.service';
import {DeviceDetection} from '../device-detection.helper';

declare const window;

export enum LoginMethod { OAuth = 1, LocalStrategy = 2}

@Component({
  selector: 'google-signin',
  templateUrl: './google-signin.component.html',
  styleUrls: ['./google-signin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class GoogleSigninComponent implements OnInit, OnDestroy {

  @Output() focusEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() blurEvent: EventEmitter<any> = new EventEmitter<any>();

  public isLoaded = false;
  public showSpinner = false;
  public loggedWith: number;
  public loginData = {
    demoLoginEnabled: false,
    demoUsername: '',
    demoPassword: '',
    authType: '',
  };
  public isGoogleLogin: boolean;
  public isStandardLogin: boolean;
  public isGG4L: boolean;
  public isClever: boolean;
  public auth_providers: any;

  public inputFocusNumber: number = 1;
  public forceFocus$ = new Subject();

  public loginForm: FormGroup;
  public error$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public disabledButton: boolean = true;
  public showError: boolean;
  public schoolAlreadyText$: Observable<string>;
  public passwordError: boolean;

  private changeUserName$: Subject<string> = new Subject<string>();
  private destroy$ = new Subject();

  constructor(
    private httpService: HttpService,
    private _ngZone: NgZone,
    private loginService: GoogleLoginService,
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog,
    private shortcuts: KeyboardShortcutsService,
    private storage: StorageService,
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.schoolAlreadyText$ = this.httpService.schoolSignInRegisterText$.asObservable();

    this.loginService.loginErrorMessage$.pipe(takeUntil(this.destroy$)).subscribe(message => {
      if (message === 'this user is suspended') {
        this.error$.next('Account is suspended. Please contact your school admin.');
      } else if (message === 'this user is disabled') {
        this.error$.next('Account is disabled. Please contact your school admin.');
      } else if (message === 'this profile is not active') {
        this.error$.next('Account is not active. Please contact your school admin.');
      } else if (message === 'Assistant does`t have teachers') {
        this.error$.next('Account does not have any associated teachers. Please contact your school admin.');
      } else if (message === 'pop up blocked') {
        this.error$.next('Pop up blocked. Please allow pop ups.');
      } else {
        this.error$.next(message);
      }
      this.passwordError = !!message;
      this.showSpinner = false;
    });
    this.loginService.showLoginError$.pipe(takeUntil(this.destroy$)).subscribe((show: boolean) => {
      if (show) {
        this.error$.next('Incorrect password. Try again or contact your school admin to reset it.');
        this.passwordError = true;
        this.showSpinner = false;
      }
    });
  }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        filter((qp: QueryParams) => !!qp.code),
        tap(() => {
          this.disabledButton = false;
          this.showSpinner = true;
        })
      )
      .subscribe((qp) => {
        this.storage.removeItem('context');
        if (this.router.url.includes('google_oauth')) {
          return this.loginGoogle(qp.code as string);
        } else if (!!qp.scope) {
          return this.loginClever(qp.code as string);
        } else {
          return this.loginSSO(qp.code as string);
        }
    });

    this.loginForm = new FormGroup({
      username: new FormControl(),
      password: new FormControl()
    });

    this.shortcuts.onPressKeyEvent$
      .pipe(
        takeUntil(this.destroy$),
        pluck('key')
      )
      .subscribe(key => {
        if (key[0] === 'tab') {
          if (this.inputFocusNumber < 2) {
            this.inputFocusNumber += 1;
          } else if (this.inputFocusNumber === 2) {
            this.inputFocusNumber = 1;
          }
          this.forceFocus$.next();
        } else if (key[0] === 'enter') {
          if (!this.disabledButton && !this.loginData.demoLoginEnabled) {
            this.nextButtonTapped();
          } else if (this.loginData.demoLoginEnabled) {
            this.demoLogin();
          }
        }
      });

    this.storage.showError$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.httpService.errorToast$.next({
        header: 'Cookies are blocked',
        message: this.domSanitizer.bypassSecurityTrustHtml('<div>Please un-block your cookies so you can sign into SmartPass. <a style="color: #E32C66" href="https://www.smartpass.app/cookies-error" target="_blank">Need help?</a></div>')
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loginSSO(code: string) {
    this.storage.setItem('authType', 'gg4l');
    this.loginService.updateAuth({ gg4l_code: code, type: 'gg4l-login'});
    return of (null);
  }

  loginClever(code: string) {
    this.httpService.clearInternal();
    this.storage.setItem('authType', 'clever');
    this.loginService.updateAuth({clever_code: code, type: 'clever-login'});
    return of(null);
  }

  loginGoogle(code: string) {
    this.storage.setItem('authType', 'google');
    this.loginService.updateAuth({google_code: code, type: 'google-login'});
    return of(null);
  }

  updateDemoUsername(event) {
    this.showSpinner = false;
    if (!event) {
      this.loginData.demoLoginEnabled = false;
      this.loginData.demoUsername = '';
      this.isGoogleLogin = false;
      this.disabledButton = true;
      return false;
    }
    this.loginData.demoUsername = event;
    this.disabledButton = false;
    this.error$.next(null);
    this.passwordError = false;
  }

  updateDemoPassword(event) {
    this.error$.next(null);
    this.passwordError = false;
    this.showSpinner = false;
    // this.loginData.demoPassword = event;
  }

  nextButtonTapped() {
    this.showSpinner = true;
    const userName = this.loginData.demoUsername;
    const discovery = /proxy/.test(environment.buildType) ? `/api/discovery/email_info?email=${encodeURIComponent(userName)}` : `https://smartpass.app/api/discovery/email_info?email=${encodeURIComponent(userName)}`;
    this.http.get<any>(discovery)
      .subscribe(({auth_types, auth_providers}) => {
        this.showSpinner = false;
        if (!auth_types.length) {
          this.error$.next(`Couldn't find that username or email`);
          this.showSpinner = false;
          this.isGoogleLogin = false;
          this.isStandardLogin = false;
          this.loginData.demoLoginEnabled = false;
          return;
        } else {
          this.error$.next(null);
        }
        this.loginData.authType = auth_types[auth_types.length - 1];
        this.auth_providers = auth_providers[0];
        const auth = auth_types[auth_types.length - 1];
        if (auth.indexOf('google') !== -1) {
          this.loginData.demoLoginEnabled = false;
          this.isStandardLogin = false;
          this.isGG4L = false;
          this.isGoogleLogin = true;
          this.isClever = false;
        } else if (auth.indexOf('clever') !== -1) {
          this.loginData.demoLoginEnabled = false;
          this.isStandardLogin = false;
          this.isGG4L = false;
          this.isGoogleLogin = false;
          this.isClever = true;
        } else if (auth.indexOf('gg4l') !== -1) {
          this.loginData.demoLoginEnabled = false;
          this.isStandardLogin = false;
          this.isGoogleLogin = false;
          this.isClever = false;
          this.isGG4L = true;
        } else if (auth.indexOf('password') !== -1) {
          this.isGoogleLogin = false;
          this.isStandardLogin = true;
          this.isClever = false;
          this.isGG4L = false;
        } else {
          this.loginData.demoLoginEnabled = false;
        }
        this.disabledButton = false;
        this.signIn();
        this.cdr.detectChanges();
      }, (_ => {
        this.error$.next(`Couldn't find that username or email`);
        this.showSpinner = false;
      }));
  }

  signIn() {
    this.storage.removeItem('authType');
    this.httpService.schoolSignInRegisterText$.next(null);
    if (this.isGoogleLogin) {
      this.storage.setItem('authType', this.loginData.authType);
      this.initLogin();
    } else if (this.isClever) {
      this.showSpinner = true
      this.storage.setItem('authType', this.loginData.authType);
      const district = this.auth_providers && this.auth_providers.provider === 'clever' ? this.auth_providers.sourceId : null;
      const redirect = this.httpService.getEncodedRedirectUrl();
      if (district) {
        window.location.href = `https://clever.com/oauth/authorize?response_type=code&redirect_uri=${redirect}&client_id=f4260ade643c042482a3&district_id=${district}`;
      } else {
        window.location.href = `https://clever.com/oauth/authorize?response_type=code&redirect_uri=${redirect}&client_id=f4260ade643c042482a3`;
      }
    } else if (this.isGG4L) {
      this.showSpinner = true;
      this.storage.setItem('authType', this.loginData.authType);
      if (this.storage.getItem('gg4l_invalidate')) {
        window.location.href = `https://sso.gg4l.com/oauth/auth?response_type=code&client_id=${environment.gg4l.clientId}&redirect_uri=${window.location.href}&invalidate=true`;
      } else {
        window.location.href = `https://sso.gg4l.com/oauth/auth?response_type=code&client_id=${environment.gg4l.clientId}&redirect_uri=${window.location.href}`;
      }
    } else if (this.isStandardLogin) {
      this.storage.setItem('authType', this.loginData.authType);
      this.inputFocusNumber = 2;
      this.forceFocus$.next();
      this.loginData.demoLoginEnabled = true;
    }
    this.isGoogleLogin = false;
    this.isGG4L = false;
    this.isStandardLogin = false;
    this.isClever = false;
  }

  demoLogin() {
      this.showSpinner = true;
      this.titleService.setTitle('SmartPass');
      this.metaService.removeTag('name = "description"');
      this.loggedWith = LoginMethod.LocalStrategy;
      this.loginService.showLoginError$.next(false);
      // this.loginService.loginErrorMessage$.next(null);

      of(this.loginService.signInDemoMode(this.loginForm.get('username').value, this.loginForm.get('password').value))
      .pipe(
        finalize(() => {
          this.showSpinner = false;
          this.cdr.detectChanges();
        })
      );
  }

  initLogin() {
    this.loggedWith = LoginMethod.OAuth;
    this.loginService.showLoginError$.next(false);
    this.loginService.loginErrorMessage$.next(null);
    this.loginService.signIn(this.loginData.demoUsername);
    this.cdr.detectChanges();
  }

}
