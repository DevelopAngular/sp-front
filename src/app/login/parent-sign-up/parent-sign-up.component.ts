import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { DeviceDetection } from '../../device-detection.helper';
import { GoogleLoginService } from '../../services/google-login.service';
import { environment } from '../../../environments/environment';

declare const window;

@Component({
  selector: 'app-parent-sign-up',
  templateUrl: './parent-sign-up.component.html',
  styleUrls: ['./parent-sign-up.component.scss']
})
export class ParentSignUpComponent implements OnInit, OnDestroy {

  public signUpForm: FormGroup;
  public trustedBackgroundUrl: SafeUrl;
  public formPosition = '20px';
  public loginData = {
    demoLoginEnabled: false,
    demoUsername: '',
    demoPassword: '',
    authType: '',
  };

  private isIOSMobile: boolean = DeviceDetection.isIOSMobile();
  private isAndroid: boolean = DeviceDetection.isAndroid();

  private pending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  destroy$: Subject<any> = new Subject<any>();
  public inputIndex = 0;

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private http: HttpClient,
    private loginService: GoogleLoginService,
    private _zone: NgZone
  ) {
    this.trustedBackgroundUrl = this.sanitizer.bypassSecurityTrustStyle('url(\'./assets/Signup Background.svg\')');
  }

  get isMobileDevice() {
    return this.isAndroid || this.isIOSMobile;
  }

  ngOnInit(): void {
    window.appLoaded();

    this.signUpForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,

        /**
         * Why didn't we use Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]{2,}$')?
         *
         * While this is definitely the more preferred Angular-like approach, this form control is passed into our
         * app-input component, which has a check for control?.errors?.email and generates the appropriate error
         * message in the form field.
         *
         * Validators.email works in most cases but allows strings such as 'someone@example', which we don't want.
         * Therefore, we use a custom validator function that checks the pattern but still returns an email error
         * so the app-input can display the error in the form field.
         */
        (fc: FormControl) => {
        return !(fc.value as string).match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]{2,}$/)
          ? { email: true }
          : null;
        },
      ], [this.uniqueEmailValidator.bind(this)]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ])
    });

    this.loginService.isAuthenticated$.pipe(
      takeUntil(this.destroy$),
      filter(Boolean)
    ).subscribe({
      next: () => {
        console.log('parent-sign-up routing!!!!!');
        this.router.navigate(['']);
      }
    });
  }

  private uniqueEmailValidator(control: FormControl) {
    return control.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(500),
        take(1),
        switchMap((email: string) => {
          return this.http.post(environment.schoolOnboardApiRoot + '/v1/check-email', { email })
            .pipe(
              take(1),
              map(({exists}: {exists: boolean}) => {
                return (!exists ? { uniqEmail: true } : null);
              })
            );
        })
      );
  }

  formMobileUpdatePosition() {
    if (this.isMobileDevice) {
      this.formPosition = '-25px';
    }
  }

  openLink(link) {
    window.open(link);
  }

  goLogin() {
    this.router.navigate(['']);
  }

  registerParent() {
    window.waitForAppLoaded(true);
    this.pending.next(true);

    this.http.post(environment.schoolOnboardApiRoot + '/v1/parent/sign_up', this.signUpForm.value).subscribe({
      next: () => {
        const { email, password } = this.signUpForm.value;
        this.loginService.signInDemoMode(email, password);
        // this.router.navigate(['']);
      },
      error: err => {
        if (err && err.error !== 'popup_closed_by_user') {
          this.loginService.showLoginError$.next(true);
        }
        this.pending.next(false);
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['parent']);
  }

  /*Scroll hack for ios safari*/

  preventTouch($event) {
    $event.preventDefault();
  }

  ngOnDestroy () {
    this.destroy$.next(true);
  }
}
