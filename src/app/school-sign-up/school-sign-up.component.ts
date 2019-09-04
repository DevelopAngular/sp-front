import {AfterViewInit, Component, EventEmitter, NgZone, OnInit, Output} from '@angular/core';
import { environment } from '../../environments/environment';
import {constructUrl, QueryParams} from '../live-data/helpers';
import {catchError, delay, map, switchMap, tap} from 'rxjs/operators';
import {BehaviorSubject, from, Observable, of, throwError} from 'rxjs';
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
import {GettingStartedProgressService} from '../admin/getting-started-progress.service';

declare const window;

@Component({
  selector: 'app-school-sign-up',
  templateUrl: './school-sign-up.component.html',
  styleUrls: ['./school-sign-up.component.scss']
})
export class SchoolSignUpComponent implements OnInit, AfterViewInit {

  @Output() schoolCreatedEvent: EventEmitter<boolean> = new EventEmitter();
  private pending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public pending$: Observable<boolean> = this.pending.asObservable();
  private AuthToken: string;
  private jwt: JwtHelperService;
  public showError = { loggedWith: null, error: null };
  public school: any;
  public errorToast;
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
    private gsProgress: GettingStartedProgressService
  ) {
    this.jwt = new JwtHelperService();
    this.errorToast = this.httpService.errorToast$;
    window.appLoaded(0);
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
  test(event) {
    // console.log(event[0]._d);
  }
  initLogin() {
    return this.loginService.GoogleOauth.signIn()
      .then((auth) => {
        console.log(auth);
        return auth.getAuthResponse();
      });

  }
  createSchool() {
    this.pending.next(true);
        return from(this.initLogin())
          .pipe(
            tap(p => console.log(p)),
            switchMap((auth: any) => {

              const hd = this.jwt.decodeToken(auth.id_token)['hd'];

              if (!hd || hd === 'gmail.com') {
                this.loginService.showLoginError$.next(false);
                this.showError.loggedWith = LoginMethod.OAuth;
                this.showError.error = true;
                return of(false);
              } else {
                this.gsProgress.updateProgress('create_school:start');
                return this.http.post(environment.schoolOnboardApiRoot + '/onboard/schools', {
                  user_token: auth.id_token,
                  google_place_id: this.school.place_id
                }, {
                  headers: {
                    'Authorization': 'Bearer ' + this.AuthToken // it's temporary
                  }
                }).pipe(
                  // tap(() => this.gsProgress.updateProgress('create_school:end')),
                  map((res: any) => {
                    this._zone.run(() => {
                      this.loginService.updateAuth(auth);
                      this.storage.setItem('last_school_id', res.school.id);
                    });
                    return true;
                  }),
                );
              }
            }),
            delay(1000),
            switchMap(() => {
              return this.loginService.isAuthenticated$;
            }),
            catchError((err) => {
              if (err && err.error !== 'popup_closed_by_user') {
                this.loginService.showLoginError$.next(true);
              }
              this.pending.next(false);
              return throwError(err);
            })
          ).subscribe((res) => {
            this.pending.next(false);
            if (res) {
              this._zone.run(() => {
                this.router.navigate(['admin', 'gettingstarted']);
              });
            }
          });
  }

  checkSchool(school: any) {
    this.pending.next(true);
    this.http.get(constructUrl(environment.schoolOnboardApiRoot + '/onboard/schools/check_school', {place_id: school.place_id}), {
      headers: {
        'Authorization': 'Bearer ' + this.AuthToken // it's temporary
      }})
      .pipe(
        catchError((err) => {
          if (err.status === 401) {
            this.httpService.errorToast$.next({
              header: 'Key invalid.',
              message: 'Please contact us at support@smartpass.app'
            });
          }
          return throwError(err);
        })
      )
      .subscribe((onboard: any) => {
        if (onboard.school_registered) {
          this.router.navigate(['']);
        } else {
          this.school = school;
        }
        this.pending.next(false);
      });
  }

}
