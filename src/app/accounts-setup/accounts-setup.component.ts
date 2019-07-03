import {AfterViewInit, Component, OnInit} from '@angular/core';
import {LoginMethod} from '../google-signin/google-signin.component';
import {GoogleLoginService} from '../services/google-login.service';
import {UserService} from '../services/user.service';
import {catchError, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {User} from '../models/User';
import {from, Observable, of, Subject, throwError} from 'rxjs';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';
import {HttpClient} from '@angular/common/http';

declare const window;

@Component({
  selector: 'app-accounts-setup',
  templateUrl: './accounts-setup.component.html',
  styleUrls: ['./accounts-setup.component.scss']
})
export class AccountsSetupComponent implements OnInit, AfterViewInit {
  CloseButton$: Observable<User>;
  private jwt: JwtHelperService;
  public showError = { loggedWith: null, error: null };
  public gSuiteConnected: boolean = false;
  public usersForSyncSelected: boolean = false;
  private destroyer$ = new Subject();
  public googleAuth: string;

  constructor(
    private http: HttpClient,
    private loginService: GoogleLoginService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.jwt = new JwtHelperService();
  }

  ngOnInit() {
    // const test = 'https://smartpass.app/api/staging/v1/schools/2/syncing/oauth_trampoline?state=%7B%22nonce%22:%22DBHQ4xBq1pEJlL0mfdmxKdpNpRTY7C1DXZ00GoQYJY3XHWinirDXCNCC0TGzRfGb%22,%22trampoline_uri%22:%22https://smartpass.app/api/staging/v1/schools/2/syncing/oauth_trampoline%22%7D&code=4/eQFYM21MWgv1Nd8H3MKblHr6pBYN5AmsS2166bx2MM7BPAEgyhW-SNBfzHoGDT7aspsqi0EnLd8znzV0XKInQ0s&scope=https://www.googleapis.com/auth/admin.directory.user.readonly%20https://www.googleapis.com/auth/admin.directory.orgunit.readonly%20https://www.googleapis.com/auth/admin.directory.group.readonly%20https://www.googleapis.com/auth/admin.directory.domain.readonly';
    this.route.queryParams
      .pipe(takeUntil(this.destroyer$))
      .subscribe((qp: any) => {
        const {googleAuth} = qp;
        this.googleAuth = this.googleAuth ? this.googleAuth : googleAuth;
        this.router.navigate(['accounts_setup']);
      })
    this.CloseButton$ = this.userService.userData
      .pipe(
        filter((cu: User) => {
          return cu && cu.isAdmin();
        })
      );
  }
  ngAfterViewInit(): void {
    window.appLoaded();
  }
  close() {
    this.router.navigate(['admin']);
  }
  goToLogin() {
    this.router.navigate(['']);
  }

  initLogin(popup?: boolean) {

    if (popup) {
      // window.returnAuthToken = function(token) {
      //   if (token) {
      //     console.log('OK');
      //   } else {
      //     console.error('Failed!');
      //   }
      // }
      window.onmessage = function (message) {
        console.log(message);
      }
      // window.open('http://localhost:4200/admin/dasboard');
      window.open(this.googleAuth);

    } else {

      return this.loginService.GoogleOauth.signIn()
        .then((auth) => {
          return auth.getAuthResponse();
        });
    }


  }

  connectGSuite() {
      if (this.gSuiteConnected && this.usersForSyncSelected) {
        this.router.navigate(['admin', 'accounts']);
      } else {

        from(this.initLogin())
          .pipe(
            switchMap((auth: any) => {
              console.log(auth);

              const hd = this.jwt.decodeToken(auth.id_token)['hd'];

              if (!hd || hd === 'gmail.com') {
                // this.loginState = 'profile';
                this.loginService.showLoginError$.next(false);
                this.showError.loggedWith = LoginMethod.OAuth;
                this.showError.error = true;

                return of(false);
              } else {
                this.gSuiteConnected = true;
                return  of(true);
                // return this.http.post('https://smartpass.app/api/staging/onboard/schools', {
                //   user_token: auth.id_token,
                // }, {
                //   headers: {
                //     'Authorization': 'Bearer ' + '' // it's temporary
                //   }
                // });
              }
            }),
            catchError((err) => {
              console.log('Error occured =====>', err);

              if (err && err.error !== 'popup_closed_by_user') {
                console.log('Erro should be shown ====>')
                this.loginService.showLoginError$.next(true);
              }
              return throwError(err);

            })
          )
          .subscribe();
      }

  }
}
