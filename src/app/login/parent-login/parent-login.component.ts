import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, Meta, SafeUrl, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import {filter, finalize, pluck, takeUntil} from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DeviceDetection } from '../../device-detection.helper';
import { LoginMethod } from '../../google-signin/google-signin.component';
import { GoogleLoginService } from '../../services/google-login.service';
import { HttpService } from '../../services/http-service';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { LoginDataService } from '../../services/login-data.service';
import { StorageService } from '../../services/storage.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-parent-login',
  templateUrl: './parent-login.component.html',
  styleUrls: ['./parent-login.component.scss']
})
export class ParentLoginComponent implements OnInit {

  public showSpinner = false;
  public loggedWith: number;
  public loginForm: FormGroup;
  public formPosition = '20px';
  public loginData = {
    demoLoginEnabled: false,
    demoUsername: '',
    demoPassword: '',
    authType: '',
  };

  public auth_providers: any;

  public inputFocusNumber = 1;
  public forceFocus$ = new Subject();

  public error$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public disabledButton = true;
  public schoolAlreadyText$: Observable<string>;
  public passwordError: boolean;

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
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private loginDataService: LoginDataService
  ) {
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

    // @ts-ignore
    window.appLoaded();
    this.loginForm = new FormGroup({
      username: new FormControl(),
      password: new FormControl()
    });

    this.shortcuts.onPressKeyEvent$
      .pipe(
        filter(() => !this.isMobile),
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
      this.toast.openToast({title: 'Cookies are blocked', subtitle: 'Please un-block your cookies so you can sign into SmartPass.', type: 'error'});
    });

    this.loginDataService.loginDataQueryParams.pipe(
      filter((data) => !!data),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      if (res.email) {
        this.loginForm.get('username').setValue(res.email);
        this.loginData.demoUsername = res.email;
      }
      if (res.instant_login) {
        this.signIn();
      }
    });
  }

  updateDemoUsername(event) {
    this.showSpinner = false;
    if (!event) {
      this.loginData.demoLoginEnabled = false;
      this.loginData.demoUsername = '';
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
          this.loginData.demoLoginEnabled = false;
          return;
        } else {
          this.error$.next(null);
        }
        this.loginData.authType = auth_types[auth_types.length - 1];
        this.auth_providers = auth_providers[0];
        const auth = auth_types[auth_types.length - 1];
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
    this.storage.setItem('authType', this.loginData.authType);
    this.inputFocusNumber = 2;
    this.forceFocus$.next();
    this.loginData.demoLoginEnabled = true;
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

  preventTouch($event) {
    $event.preventDefault();
  }

}
