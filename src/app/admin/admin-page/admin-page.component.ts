import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';

import {combineLatest, BehaviorSubject, Observable, of, Subject} from 'rxjs';
import { UserService } from '../../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {delay, filter, map, skip, switchMap, takeUntil, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {HttpService} from '../../services/http-service';
import {AdminService} from '../../services/admin.service';

declare const window;

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit, AfterViewInit, OnDestroy {

  private outletDummySwitcher$ = new BehaviorSubject<boolean>(false);
  private adminPageReload$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public  hostVisibility: boolean = true;
  public showDummySwitcher$: Observable<boolean>;
  public schoolsLength$: Observable<number>;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private httpService: HttpService,
    private adminService: AdminService
  ) {

    this.userService.userData
      .pipe(
        takeUntil(this.destroy$),
        filter(user => !user.isAdmin() && user.isTeacher())
      ).subscribe(user => {
          window.waitForAppLoaded();
          this.goHome(user);
      });
  }

  ngOnInit() {
    this.schoolsLength$ = this.httpService.schoolsLength$;

    this.adminPageReload$.pipe(
      takeUntil(this.destroy$),
      skip(1),
      tap(() => {
        this.hostVisibility = false;
      }),
      delay(10),
    )
    .subscribe((v) => {
      this.outletDummySwitcher$.next(false);
      this.hostVisibility = true;
    });

    of(location.pathname.split('/'))
      .pipe(
        takeUntil(this.destroy$),
        map((fragments) => fragments.filter(f => !!f)),
        filter((value) => {
         if (environment.production) {
           return  value.length < 3;
         } else {
           return  value.length < 2;
         }
        }),
        switchMap(() => this.userService.getUserWithTimeout()),
        filter(user => !!user),
      )
      .subscribe(user => {
        const availableAccessTo = user.roles.filter((_role) => _role.match('access_'));
        let tab;
        if (availableAccessTo.includes('access_admin_dashboard')) {
          tab = 'dashboard';
        } else if (availableAccessTo.includes('access_hall_monitor')) {
          tab = 'hallmonitor';
        } else if (availableAccessTo.includes('access_admin_search')) {
          tab = 'search';
        } else if (availableAccessTo.includes('access_pass_config')) {
          tab = 'passconfig';
        } else if (availableAccessTo.includes('access_user_config')) {
          tab = 'accounts';
        }
        this.router.navigate(['/admin', tab]);
    });


  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    window.appLoaded();
  }

  onReloadPage(event) {
    this.adminPageReload$.next(true);
  }

  goHome(user) {
      if (user) {
        if (user.isStudent() || user.isTeacher()) {
          this.router.navigate(['/main']);
          return;
        }
      }
      this.router.navigate(['/sign-out']);
  }

  hideOutlet(event: boolean) {
    this.outletDummySwitcher$.next(event);
  }

}
