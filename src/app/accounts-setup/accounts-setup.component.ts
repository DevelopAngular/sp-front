import {AfterViewInit, Component, OnInit} from '@angular/core';
import {LoginMethod} from '../google-signin/google-signin.component';
import {GoogleLoginService} from '../services/google-login.service';
import {UserService} from '../services/user.service';
import {catchError, filter, map, switchMap} from 'rxjs/operators';
import {User} from '../models/User';
import {from, Observable, of, Subject, throwError} from 'rxjs';
import {Router} from '@angular/router';
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

  constructor(
    private http: HttpClient,
    private loginService: GoogleLoginService,
    private userService: UserService,
    private router: Router
  ) {
    this.jwt = new JwtHelperService();
  }

  ngOnInit() {
    this.CloseButton$ = this.userService.userData
      .pipe(
        filter((cu: User) => {
          return cu && cu.isAdmin();
        })
      );
      // .subscribe(() => {
      //
      // });
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

  initLogin() {
    return this.loginService.GoogleOauth.signIn()
      .then((auth) => {
        return auth.getAuthResponse();
      });

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
