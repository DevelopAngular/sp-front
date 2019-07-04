import {AfterViewInit, Component, OnInit} from '@angular/core';
import {LoginMethod} from '../google-signin/google-signin.component';
import {GoogleLoginService} from '../services/google-login.service';
import {UserService} from '../services/user.service';
import {catchError, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {User} from '../models/User';
import {from, fromEvent, Observable, of, Subject, throwError} from 'rxjs';
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
    this.route.queryParams
      .pipe(takeUntil(this.destroyer$))
      .subscribe((qp: any) => {
        const {googleAuth} = qp;
        this.googleAuth = this.googleAuth ? this.googleAuth : googleAuth;
        // this.router.navigate(['accounts_setup']);
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

    // if (popup) {
      const left = (window.innerWidth - 600) / 2
      const wRef = window.open(this.googleAuth, 'windowName', `width=600,height=840,left=${left},top=50`);

      return fromEvent(window, 'message')
              .pipe(
                map((message: any) => {
                console.log(message);
                wRef.close()
                  return message.data.token;
                })
              );
        // .subscribe((res) => {
        //   console.log(res);
        // });
    // } else {
    //   return this.loginService.GoogleOauth.signIn()
    //     .then((auth) => {
    //       return auth.getAuthResponse();
    //     });
    // }


  }

  connectGSuite() {
      if (this.gSuiteConnected && this.usersForSyncSelected) {
        this.router.navigate(['admin', 'accounts']);
      } else {

        this.initLogin()
          .pipe(
            switchMap((auth: any) => {
              console.log(auth);

              const hd = this.jwt.decodeToken(auth.access_token)['hd'];

              if (!hd || hd === 'gmail.com') {
                this.loginService.showLoginError$.next(false);
                this.showError.loggedWith = LoginMethod.OAuth;
                this.showError.error = true;

                return of(false);
              } else {
                this.gSuiteConnected = true;
                return  of(true);
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
