import {AfterViewInit, Component, OnInit} from '@angular/core';

import {combineLatest, BehaviorSubject, Observable, of} from 'rxjs';
import { UserService } from '../../services/user.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {delay, filter, map, skip, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
declare const window;
@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit, AfterViewInit {

  private outletDummySwitcher$ = new BehaviorSubject<boolean>(false);
  private adminPageReload$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public  hostVisibility: boolean = true;
  public showDummySwitcher$: Observable<boolean>;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.showDummySwitcher$ = combineLatest(
      this.userService.userData,
      this.outletDummySwitcher$,
      (u, d) =>  {
        console.log(u, d);
        return d || (u && !u.isAdmin());
      }
    );
  }

  ngOnInit() {

    this.showDummySwitcher$.subscribe((v) => {
      if (v) {
        window.appLoaded();
      }
    });
    this.adminPageReload$.pipe(
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
  ngAfterViewInit() {
    window.appLoaded();
  }
  onReloadPage(event) {
    this.adminPageReload$.next(true);
  }

  hideOutlet(event: boolean) {
    this.outletDummySwitcher$.next(event);
  }

}
