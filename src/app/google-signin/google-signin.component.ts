import {Component, NgZone, OnInit} from '@angular/core';
import { GoogleLoginService } from '../services/google-login.service';
import {of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap} from 'rxjs/operators';
import {HttpService} from '../services/http-service';
import {Meta, Title} from '@angular/platform-browser';
import {environment} from '../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {NoAccountComponent} from '../no-account/no-account.component';
import {MatDialog} from '@angular/material';
import {UserService} from '../services/user.service';
import {HttpClient} from '@angular/common/http';

declare const window;

export enum LoginMethod { OAuth = 1, LocalStrategy = 2}

@Component({
  selector: 'google-signin',
  templateUrl: './google-signin.component.html',
  styleUrls: ['./google-signin.component.scss']
})

export class GoogleSigninComponent implements OnInit {

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
  private changeUserName$: Subject<string> = new Subject<string>();


  constructor(
    private httpService: HttpService,
    private _ngZone: NgZone,
    private loginService: GoogleLoginService,
    private titleService: Title,
    private metaService: Meta,
    private route: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog

  ) {
    this.loginService.isAuthLoaded().subscribe(isLoaded => {
      this._ngZone.run(() => {
        this.isLoaded = isLoaded;
      });
    });
    this.httpService.errorToast$.subscribe(v => {
      this.showSpinner = !!v;
    });
    this.loginService.showLoginError$.subscribe((show: boolean) => {
      if (show) {
        const errMessage = this.loggedWith === 1
          ? 'Please sign in with your school account or contact your school administrator.'
          : 'Please check your username and password or contact your school administrator.';

        this.httpService.errorToast$.next({
          header: 'Oops! Sign in error.',
          message: errMessage
        });
      }
    });
  }

  ngOnInit(): void {
    // this.route.queryParams
    //   .pipe(
    //     filter(qp => !!qp && !!qp.code),
    //     // switchMap((qp) => this.httpService.gg4l(qp.code))
    //   )
    //   .subscribe((qp) => {
    //     console.log(qp);
    //   });
    this.changeUserName$.pipe(
      filter(userName => userName.length && userName[userName.length - 1] !== '@' && userName[userName.length - 1] !== '.'),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap(userName => {
        return this.http.get<any>(`https://smartpass.app/api/discovery/email_info?email=${encodeURIComponent(userName)}`);
      })
    ).subscribe(({auth_types}) => {
      this.loginData.authType = auth_types.filter(at => at !== 'gg4l')[0];
      switch (this.loginData.authType) {
        case 'google':
          this.loginData.demoLoginEnabled = false;
          this.isGoogleLogin = true;
          break;
        case 'password':
          this.loginData.demoLoginEnabled = true;
          break;
        // case 'gg4l':
        //   this.loginSSO();
        //   this.isGoogleLogin = true;
        //   break;
        default:
          this.isGoogleLogin = false;
          this.loginData.demoLoginEnabled = false;
      }
    });
  }

  loginSSO() {
    this.loginService.simpleSignOn();
      // .then((res) => {
      //   console.log(res);
      // })
      // .catch((err) => {
      //   console.log(err);
      // });
  }
  updateDemoUsername(event) {
    this.loginData.demoUsername = event;
    if (!event) {
      this.loginData.demoLoginEnabled = false;
    }
    this.changeUserName$.next(event);
  }

  toggleDemoLogin() {
    window.open('https://www.smartpass.app/get-started', '_self');
  }

  checkUserAuthType() {
    this.initLogin();
    // if (!this.loginData.demoLoginEnabled) {
      // this.http.get<any>(`https://smartpass.app/api/discovery/email_info?email=${encodeURIComponent(this.loginData.demoUsername)}`)
      //   .subscribe(({auth_types}) => {
      //     if (!auth_types.length) {
      //       this.loginService.showLoginError$.next(true);
      //     }
      //     this.loginData.authType = auth_types.filter(at => at !== 'gg4l')[auth_types.length - 1];
      //     switch (this.loginData.authType) {
      //       case 'google':
      //         this.initLogin();
      //         break;
      //       case 'password':
      //         this.loginData.demoLoginEnabled = true;
      //         break;
      //       // case 'gg4l':
      //       //   this.loginSSO();
      //       //   break;
      //     }
      //   });
    // } else {
    //   this.demoLogin();
    // }
  }

  demoLogin() {

    this.showSpinner = true;
    if (this.loginData.demoUsername && this.loginData.demoPassword) {
      this.titleService.setTitle('SmartPass');
      this.metaService.removeTag('name = "description"');
      this.loggedWith = LoginMethod.LocalStrategy;
      this.loginService.showLoginError$.next(false);
      window.waitForAppLoaded(true);
      of(this.loginService.signInDemoMode(this.loginData.demoUsername, this.loginData.demoPassword))
      .pipe(
        // tap((res) => { console.log(res); }),
        finalize(() => {
          this.showSpinner = false;
        }),
      );
    }
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
