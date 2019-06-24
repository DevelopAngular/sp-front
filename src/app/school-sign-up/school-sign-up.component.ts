import {AfterViewInit, Component, EventEmitter, NgZone, OnInit, Output} from '@angular/core';
import {constructUrl, QueryParams} from '../live-data/helpers';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {from, Observable, of, throwError} from 'rxjs';
import {LoginMethod} from '../google-signin/google-signin.component';
import {GoogleAuthService} from '../services/google-auth.service';
import {HttpClient} from '@angular/common/http';
import {HttpService} from '../services/http-service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {GoogleLoginService} from '../services/google-login.service';
import {UserService} from '../services/user.service';
import {StorageService} from '../services/storage.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';

declare const window;

@Component({
  selector: 'app-school-sign-up',
  templateUrl: './school-sign-up.component.html',
  styleUrls: ['./school-sign-up.component.scss']
})
export class SchoolSignUpComponent implements OnInit, AfterViewInit {

  @Output() schoolCreatedEvent: EventEmitter<boolean> = new EventEmitter();
  private AuthToken: string;
  private jwt: JwtHelperService;
  public showError = { loggedWith: null, error: null };

  constructor(
    private googleAuth: GoogleAuthService,
    private http: HttpClient,
    private httpService: HttpService,
    private userService: UserService,
    private loginService: GoogleLoginService,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private _zone: NgZone,
  ) {
    this.jwt = new JwtHelperService();
  }

  ngOnInit() {

    this.route.queryParams.subscribe((qp: QueryParams) => {
      if (!qp.key) {
          this.router.navigate(['']);
      } else {
        this.AuthToken = qp.key as string;
      }
      console.log(this.AuthToken);
    });
  }
  ngAfterViewInit() {
    window.appLoaded();
  }

  initLogin() {
    return this.loginService.GoogleOauth.signIn()
      .then((auth) => {
        return auth.getAuthResponse();
      });

  }

  checkSchool(placeId: string) {
    this.http.get(constructUrl('https://smartpass.app/api/staging/onboard/schools/check_school', {place_id: placeId}), {
      headers: {
        'Authorization': 'Bearer ' + this.AuthToken // it's temporary
      }})
      .pipe(
        switchMap((onboard: any): Observable<any> => {
          if (!onboard.school_registered) {
            return from(this.initLogin())
              .pipe(
                tap(p => console.log(p)),
                switchMap((auth: any) => {
                  console.log(auth);

                  const hd = this.jwt.decodeToken(auth.id_token)['hd'];

                  // debugger

                  if (!hd || hd === 'gmail.com') {
                    // this.loginState = 'profile';
                    this.loginService.showLoginError$.next(false);
                    this.showError.loggedWith = LoginMethod.OAuth;
                    this.showError.error = true;
                    return of(false);
                  } else {

                    return this.http.post('https://smartpass.app/api/staging/onboard/schools', {
                      user_token: auth.id_token,
                      google_place_id: placeId
                    }, {
                      headers: {
                        'Authorization': 'Bearer ' + this.AuthToken // it's temporary
                      }
                    }).pipe(
                      map((res: any) => {
                        this._zone.run(() => {
                          console.log(res);
                          this.loginService.updateAuth(auth);
                          this.storage.setItem('last_school_id', res.school.id);
                        });
                        return true;
                      })
                    );

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
              );
          } else {
            // this.loginState = 'profile';

            return of(false);
          }
        })
      )
      .subscribe((res) => {
        console.log(res);
        // this.schoolCreatedEvent.emit(res);
        // onSchoolCreated(evt: boolean) {
        //   this.schoolSignUp = false;
          if (res) {
            // window.waitForAppLoaded();
            this.router.navigate(['admin', 'gettingstarted']);
          } else {
            this.router.navigate(['']);
          }
        // }
      });
  }
  onClose(evt) {
    setTimeout(() => {
      this.loginService.showLoginError$.next(false);
      this.showError.error = evt;
      // this.loginState = 'profile';
    }, 400);
  }




}
