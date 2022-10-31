import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, delay, distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DeviceDetection } from '../../device-detection.helper';
import { constructUrl, QueryParams } from '../../live-data/helpers';
import { GoogleLoginService } from '../../services/google-login.service';
import { ParentAccountService } from '../../services/parent-account.service';

const INVALID_DOMAINS = [
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
  public inputIndex = 0;

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
