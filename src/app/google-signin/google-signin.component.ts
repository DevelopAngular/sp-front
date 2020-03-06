import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import { GoogleLoginService } from '../services/google-login.service';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, finalize, pluck, switchMap, takeUntil, tap} from 'rxjs/operators';
import {AuthContext, HttpService} from '../services/http-service';
import {Meta, Title} from '@angular/platform-browser';
import {environment} from '../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {FormControl, FormGroup} from '@angular/forms';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';

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
  public gg4lLink = `https://sso.gg4l.com/oauth/auth?response_type=code&client_id=${environment.gg4l.clientId}&redirect_uri=${window.location.href}`;
  public loginData = {
    demoLoginEnabled: false,
    demoUsername: '',
    demoPassword: '',
    authType: '',
  };
  public isGoogleLogin: boolean;
  public isStandardLogin: boolean;

  inputFocusNumber: number = 1;
  forceFocus$ = new Subject();

  public loginForm: FormGroup;
  public error$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  showError: boolean;
  private changeUserName$: Subject<string> = new Subject<string>();
  destroy$ = new Subject();

  constructor(
    private httpService: HttpService,
    private _ngZone: NgZone,
    private loginService: GoogleLoginService,
    private titleService: Title,
    private metaService: Meta,
    private route: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog,
    private shortcuts: KeyboardShortcutsService
  ) {
    this.loginService.isAuthLoaded()
      .subscribe(isLoaded => {
      this._ngZone.run(() => {
        this.isLoaded = isLoaded;
      });
    });
    this.httpService.errorToast$.subscribe(v => {
      this.showSpinner = !!v;
      if (!v) {
        this.loginForm.get('password').setValue('');
      }
    });
    this.loginService.showLoginError$.subscribe((show: boolean) => {
      if (show) {
        const errMessage = this.loggedWith === 1
          ? 'G Suite authentication failed. Please check your password or contact your school admin.'
          : 'Standard sign-in authentication failed. Please check your password or contact your school admin.';

        this.httpService.errorToast$.next({
          header: 'Oops! Sign in error.',
          message: errMessage
        });
      }
    });
  }

  ngOnInit(): void {
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
        }
      });

    this.changeUserName$.pipe(
      filter(userName => userName.length && userName[userName.length - 1] !== '@' && userName[userName.length - 1] !== '.'),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap(userName => {
        return this.http.get<any>(`https://smartpass.app/api/discovery/email_info?email=${encodeURIComponent(userName)}`);
      })
    ).subscribe(({auth_types}) => {
      if (!auth_types.length) {
        this.showError = true;
        this.isGoogleLogin = true;
      } else {
        this.showError = false;
        this.error$.next(null);
      }
      if (auth_types.indexOf('google') !== -1) {
        this.loginData.demoLoginEnabled = false;
        this.isStandardLogin = false;
        this.isGoogleLogin = true;
        this.loginData.authType = 'google';
      } else if (auth_types.indexOf('gg4l') !== -1) {
        this.isGoogleLogin = true;
        this.isStandardLogin = false;
        this.loginData.demoLoginEnabled = false;
        this.loginData.authType = 'gg4l';
      } else if (auth_types.indexOf('password') !== -1) {
        this.isGoogleLogin = false;
        this.isStandardLogin = true;
        this.loginData.authType = 'password';
      } else {
        this.loginData.demoLoginEnabled = false;
        this.loginData.authType = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loginSSO(code: string) {
    // this.loginService.simpleSignOn(code);
    return this.httpService.loginGG4L(code).pipe(
      tap((auth: AuthContext) => {
        if (auth.gg4l_token) {
          this.loginService.updateAuth({ gg4l_token: auth.gg4l_token, type: 'gg4l-login'});
        }
      })
    );
      // .then((res) => {
      //   console.log(res);
      // })
      // .catch((err) => {
      //   console.log(err);
      // });
  }
  updateDemoUsername(event) {
    if (!event) {
      this.loginData.demoLoginEnabled = false;
      this.isGoogleLogin = false;
      return false;
    }
    this.loginData.demoUsername = event;
    this.error$.next(null);
    this.changeUserName$.next(event);
  }

  updateDemoPassword(event) {
    this.loginData.demoPassword = event;
  }

  toggleDemoLogin() {
    window.open('https://www.smartpass.app/get-started', '_self');
  }

  checkUserAuthType() {
    if (this.showError) {
      this.error$.next('Couldn’t find that username or email');
      this.showError = false;
      return false;
    } else if (this.isGoogleLogin) {

      if (this.loginData.authType === 'google') {
        this.initLogin();
      } else if (this.loginData.authType === 'gg4l') {
        this.loginSSO();
      }

    } else if (this.isStandardLogin) {
      this.inputFocusNumber = 2;
      this.forceFocus$.next();
      this.loginData.demoLoginEnabled = true;
    }
  }

  demoLogin() {
      this.showSpinner = true;
      this.titleService.setTitle('SmartPass');
      this.metaService.removeTag('name = "description"');
      this.loggedWith = LoginMethod.LocalStrategy;
      this.loginService.showLoginError$.next(false);

      of(this.loginService.signInDemoMode(this.loginForm.get('username').value, this.loginForm.get('password').value))
      .pipe(
        finalize(() => {
          this.showSpinner = false;
        }),
      );
  }

  initLogin() {
    this.loggedWith = LoginMethod.OAuth;
    this.showSpinner = true;
    this.loginService.showLoginError$.next(false);
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
