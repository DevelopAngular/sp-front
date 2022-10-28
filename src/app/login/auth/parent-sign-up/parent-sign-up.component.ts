import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, delay, distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DeviceDetection } from '../../../device-detection.helper';
import { constructUrl, QueryParams } from '../../../live-data/helpers';
import { INVALID_DOMAINS } from '../../../school-sign-up/school-sign-up.component';
import { GoogleLoginService } from '../../../services/google-login.service';
import { ParentAccountService } from '../../../services/parent-account.service';

declare const window;

@Component({
  selector: 'app-parent-sign-up',
  templateUrl: './parent-sign-up.component.html',
  styleUrls: ['./parent-sign-up.component.scss']
})
export class ParentSignUpComponent implements OnInit {

  private AuthToken: string;

  public signUpForm: FormGroup;
  public trustedBackgroundUrl: SafeUrl;
  public formPosition: string = '20px';
  public loginData = {
    demoLoginEnabled: false,
    demoUsername: '',
    demoPassword: '',
    authType: '',
  };

  private isIOSMobile: boolean = DeviceDetection.isIOSMobile();
  private isAndroid: boolean = DeviceDetection.isAndroid();

  private pending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private jwt: JwtHelperService;
  private destroy$ = new Subject<any>();

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private http: HttpClient,
    private loginService: GoogleLoginService,
    private _zone: NgZone,
    private route: ActivatedRoute,
    private parentService: ParentAccountService
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

    // this.route.queryParams
    //   .pipe(
    //     switchMap((qp: QueryParams) => {
    //       this.AuthToken = qp.key as string;
    //       return this.http.get(environment.schoolOnboardApiRoot + `/onboard/schools/check_auth`, {
    //         headers: new HttpHeaders({
    //           'Authorization': 'Bearer ' + this.AuthToken
    //         })
    //       }).pipe(
    //         catchError((err) => {
    //           if (err.status === 401) {
    //             // this.httpService.errorToast$.next({
    //             //   header: 'Key invalid.',
    //             //   message: 'Please contact us at support@smartpass.app'
    //             // });
    //           }
    //           this.pending.next(false);
    //           return throwError(err);
    //         })
    //       );
    //     })
    //   )
    //   .subscribe((qp) => {
    //   console.log(this.AuthToken);
    // });
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
              // headers: new HttpHeaders({
              //   'Authorization': 'Bearer ' + this.AuthToken
              // })
            }).pipe(
              take(1),
              map(({exists}: {exists: boolean}) => {
                return (exists ? { uniqEmail: true } : null);
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
    this.router.navigate(['auth']);
  }

  registerParent(){
    //https://smartpass.app/api/staging/v1/users/@me
    // window.waitForAppLoaded(true);
    // this.pending.next(true);
    console.log("signUpForm : ", this.signUpForm)
    // this.parentService.parentSignup({...this.signUpForm.value}).pipe(
    //   // tap(() => this.gsProgress.updateProgress('create_school:end')),
    //   map((res: any) => {
    //     console.log("res : ", res);
    //     // this._zone.run(() => {
    //     //   console.log('Sign in start ===>>>>>');
    //     //   this.loginService.signInDemoMode(this.schoolForm.value.email, this.schoolForm.value.password);
    //     //   this.storage.setItem('last_school_id', res.school.id);
    //     // });
    //     return true;
    //   }),
    //   switchMap(() => {
    //     return this.loginService.isAuthenticated$;
    //   }),
    //   delay(500),
    //   catchError((err) => {
    //     console.log('Error ======>>>>>');
    //     if (err && err.error !== 'popup_closed_by_user') {
    //       this.loginService.showLoginError$.next(true);
    //     }
    //     this.pending.next(false);
    //     return throwError(err);
    //   })
    // )
    // .subscribe((res) => {
    //   console.log('Sign in end ===>>>>>', res);
    //   this.pending.next(false);
    //   if (res) {
    //     this._zone.run(() => {
    //       localStorage.setItem('open-invite-student', 'true');
    //       this.router.navigate(['parent']);
    //     });
    //   }
    // });
    this.http.post(environment.schoolOnboardApiRoot + '/v1/parent/sign_up', {
      // user_token: auth.id_token,
      // google_place_id: this.school.place_id,
      ...this.signUpForm.value
    }, {
      // headers: new HttpHeaders({
      //   'Authorization': 'Bearer ' + this.AuthToken
      // })
    }).pipe(
      // tap(() => this.gsProgress.updateProgress('create_school:end')),
      map((res: any) => {
        console.log("res : ", res);
        // this._zone.run(() => {
        //   console.log('Sign in start ===>>>>>');
        //   this.loginService.signInDemoMode(this.schoolForm.value.email, this.schoolForm.value.password);
        //   this.storage.setItem('last_school_id', res.school.id);
        // });
        this.router.navigate(['parent']);
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
        });
      }
    });
  }

  goToDashboard(){
    this.router.navigate(['parent']);
  }

  /*Scroll hack for ios safari*/

  preventTouch($event) {
    $event.preventDefault();
  }

}
