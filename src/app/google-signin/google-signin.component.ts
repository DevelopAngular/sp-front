import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {GoogleLoginService} from '../services/google-login.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {debounceTime, filter, finalize, pluck, retryWhen, switchMap, takeUntil, tap} from 'rxjs/operators';
import {AuthContext, HttpService} from '../services/http-service';
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
  styleUrls: ['./google-signin.component.scss']
})

export class GoogleSigninComponent implements OnInit, OnDestroy {

  public isLoaded = false;
  public showSpinner: boolean = false;
  public loggedWith: number;
  // public gg4lLink = `https://sso.gg4l.com/oauth/auth?response_type=code&client_id=${environment.gg4l.clientId}&redirect_uri=${window.location.href}`;
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
    private domSanitizer: DomSanitizer
  ) {
    this.schoolAlreadyText$ = this.httpService.schoolSignInRegisterText$.asObservable();
    this.loginService.isAuthLoaded()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoaded => {
      this._ngZone.run(() => {
        this.isLoaded = isLoaded;
      });
    });
    this.loginService.loginErrorMessage$.subscribe(message => {
      if (message === 'this user is suspended') {
        this.error$.next('Account is suspended. Please contact your school admin.');
      } else if (message === 'this user is disabled') {
        this.error$.next('Account is disabled. Please contact your school admin.');
      } else if (message === 'this profile is not active') {
        this.error$.next('Account is not active. Please contact your school admin.');
      }
      this.passwordError = !!message;
      this.showSpinner = false;
    });
    this.loginService.showLoginError$.subscribe((show: boolean) => {
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
        filter((qp: QueryParams) => !!qp.code),
        switchMap(({code}) => {
          if (this.storage.getItem('authType') === 'clever') {
            return this.loginClever(code as string);
          } else {
            return this.loginSSO(code as string);
          }
        })
      )
      .subscribe((auth: AuthContext) => {
        this.router.navigate(['']);
      console.log(auth);
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
            this.checkUserAuthType();
          } else if (this.loginData.demoLoginEnabled) {
            this.demoLogin();
          }
        }
      });

    this.changeUserName$.pipe(
      // filter(userName => userName.length && userName[userName.length - 1] !== '@' && userName[userName.length - 1] !== '.'),
      tap(() => this.disabledButton = false),
      debounceTime(300),
      switchMap(userName => {
        this.showSpinner = true;
        const discovery = /proxy/.test(environment.buildType) ? `/api/discovery/email_info?email=${encodeURIComponent(userName)}` : `https://smartpass.app/api/discovery/email_info?email=${encodeURIComponent(userName)}`;
        return this.http.get<any>(discovery);
      }),
      retryWhen((errors) => {
        this.showError = true;
        return errors;
      })
    ).subscribe(({auth_types}) => {
      this.showSpinner = false;
      if (!auth_types.length) {
        this.showError = true;
        this.isGoogleLogin = true;
        this.isStandardLogin = false;
        this.loginData.demoLoginEnabled = false;
        return;
      } else {
        this.showError = false;
        this.error$.next(null);
      }
      this.loginData.authType = auth_types[auth_types.length - 1];
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
      } else
        if (auth.indexOf('password') !== -1) {
        this.isGoogleLogin = false;
        this.isStandardLogin = true;
      } else {
        this.loginData.demoLoginEnabled = false;
      }
      this.disabledButton = false;
    });

    this.storage.showError$.subscribe(res => {
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
    window.waitForAppLoaded(true);
    this.loginService.updateAuth({ gg4l_token: code, type: 'gg4l-login'});
    return of (null);
  }

  loginClever(code: string) {
    window.waitForAppLoaded(true);
    this.loginService.updateAuth({clever_token: code, type: 'clever-login'});
    // return this.httpService.loginClever(code).pipe(
    //   tap((auth: AuthContext) => {
    //     if (auth.clever_token) {
    //       window.waitForAppLoaded(true);
    //       this.loginService.updateAuth({clever_token: auth.clever_token, type: 'clever-login'});
    //     }
    //   })
    // );
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
    this.error$.next(null);
    this.passwordError = false;
    this.changeUserName$.next(event);
  }

  updateDemoPassword(event) {
    this.error$.next(null);
    this.passwordError = false;
    this.showSpinner = false;
    // this.loginData.demoPassword = event;
  }

  checkUserAuthType() {
    this.storage.removeItem('authType');
    this.httpService.schoolSignInRegisterText$.next(null);
    if (this.showError) {
      this.error$.next('Couldn’t find that username or email');
      return false;
    } else if (this.isGoogleLogin) {
      this.storage.setItem('authType', this.loginData.authType);
      this.initLogin();
    } else if (this.isClever) {
      this.storage.setItem('authType', this.loginData.authType);
      window.location.href = 'https://clever.com/oauth/authorize?response_type=code&redirect_uri=https%3A%2F%2Fsmartpass-feature.lavanote.com%2Fapp&client_id=d8b866c26cd9957a4834';
    } else if (this.isGG4L) {
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
        })
      );
  }

  initLogin() {
    this.loggedWith = LoginMethod.OAuth;
    this.showSpinner = true;
    this.loginService.showLoginError$.next(false);
    this.loginService.loginErrorMessage$.next(null);
    this.loginService
      .signIn(this.loginData.demoUsername)
      .then(() => {
        this.showSpinner = false;
        // window.waitForAppLoaded();
      })
      .catch((err) => {
        if (err && err.error !== 'popup_closed_by_user') {
          this.loginService.showLoginError$.next(true);
        }
        this.showSpinner = false;
      });
  }

}
