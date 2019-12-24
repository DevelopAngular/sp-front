import {AfterViewInit, Component, OnInit} from '@angular/core';
import {GoogleLoginService} from '../services/google-login.service';
import {UserService} from '../services/user.service';
import {catchError, delay, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {User} from '../models/User';
import {fromEvent, Observable, of, Subject, throwError} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';
import {HttpClient} from '@angular/common/http';
import AuthResponse = gapi.auth2.AuthResponse;
import {AdminService} from '../services/admin.service';
import {School} from '../models/School';
import {HttpService} from '../services/http-service';
import {GSuiteSelector, OrgUnit} from '../sp-search/sp-search.component';

declare const window;

@Component({
  selector: 'app-accounts-setup',
  templateUrl: './accounts-setup.component.html',
  styleUrls: ['./accounts-setup.component.scss']
})
export class AccountsSetupComponent implements OnInit, AfterViewInit {

  public CloseButton$: Observable<User>;
  public showError = { loggedWith: null, error: null };
  public gSuiteConnected: boolean = false;
  public usersForSyncSelected: boolean = false;
  public orgUnits: any[];
  public googleAuth: string;
  public syncBody: {};

  private destroyer$ = new Subject();
  private jwt: JwtHelperService;

  constructor(
    private http: HttpClient,
    private httpService: HttpService,
    private loginService: GoogleLoginService,
    private userService: UserService,
    private adminService: AdminService,
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
    this.destroyer$.next();
    this.destroyer$.complete();
    this.router.navigate(['admin']);
  }
  goToLogin() {
    this.destroyer$.next();
    this.destroyer$.complete();
    this.router.navigate(['']);
  }

  initLogin() {

    const left = (window.innerWidth - 600) / 2;
    const wRef = window.open(this.googleAuth, 'windowName', `width=600,height=840,left=${left},top=50`);

    return fromEvent(window, 'message')
            .pipe(
              filter((message: any) => message.origin === 'https://smartpass.app'),
              map((message: any) => {

                console.log(message);
                wRef.close();
                if (message && message.data.token) {
                  message.data.token['expires'] = new Date(new Date() + message.data.token['expires_in']);
                  this.loginService.updateAuth(message.data.token as AuthResponse);
                  this.loginService.isAuthenticated$.next(true);
                  return message.data.school_id;
                }
              }),
              delay(100),
              switchMap((schoolId) => {
                if (schoolId) {
                  return this.adminService.getSchoolById(schoolId);
                }
              }),
              switchMap((school: School) => {
                if (school && school.id) {
                  this.httpService.setSchool(school);
                  return of(true);
                } else {
                  return of(false);
                }
              }),
              catchError((err) => {
                console.log(err);
                if (err && err.error !== 'popup_closed_by_user') {
                  this.loginService.showLoginError$.next(true);
                }
                return throwError(err);
              }),
              takeUntil(this.destroyer$)
            );
  }

  connectGSuite() {
    if (this.gSuiteConnected && this.usersForSyncSelected) {
      this.adminService.updateGSuiteOrgs(this.syncBody)
        .pipe(
          switchMap(() => {
            return this.adminService.updateOnboardProgress('setup_accounts:end');
          })
        )
        .subscribe((res) => {
          console.log(res);
          this.destroyer$.next();
          this.destroyer$.complete();
          this.router.navigate(['admin', 'accounts']);
        });
    } else {

      this.initLogin()
        .pipe(
          tap(() => window.appLoaded(1000))
        )
        .subscribe((res) => {
          if (res) {
            console.log(res);
            this.gSuiteConnected = true;
            this.destroyer$.next();
            this.destroyer$.complete();
          }
        });
    }
  }

  prepareDataToSync(evt: OrgUnit[]) {
    this.usersForSyncSelected = !!evt;
    this.syncBody = {};
    this.syncBody['is_enabled'] = true;

    evt.forEach((item: OrgUnit) => {
      this.syncBody[`selector_${item.unitId}s`] = item.selector.map((s: GSuiteSelector) => s.as);
    });
    console.log(this.syncBody);

  }
}
