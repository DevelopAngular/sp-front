import { Component, OnInit } from '@angular/core';

import {combineLatest, BehaviorSubject, Observable, of} from 'rxjs';
import { UserService } from '../../services/user.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {delay, filter, map, skip, switchMap, tap} from 'rxjs/operators';
declare const window;
@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {

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
      (u, d) => d || !u.isAdmin()
    );
  }

  ngOnInit() {
    this.showDummySwitcher$.subscribe((v) => {
      if (v) {
        console.log(v);
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
      console.log('RELOAD SUBSCRIBED');
      this.outletDummySwitcher$.next(false);
      this.hostVisibility = true;
    });
    of(location.pathname.split('/'))
      .pipe(
        map((fragments) => fragments.filter(f => !!f)),
        // filter(value => value instanceof NavigationEnd ),
        tap((value) => console.log(value)),
        filter((value) => value.length < 2),
        switchMap(() => this.userService.getUserWithTimeout()),
        filter(user => !!user)
      )
      .subscribe(user => {
        console.log('ROUTER EVTS ===>', user);

        const availableAccessTo = user.roles.filter((_role) => _role.match('admin_'));
        let tab;
        if (availableAccessTo.includes('admin_dashboard')) {
          tab = 'dasboard';
        } else if (availableAccessTo.includes('admin_hallmonitor')) {
          tab = 'hallmonitor';
        } else if (availableAccessTo.includes('admin_search')) {
          tab = 'search';
        } else if (availableAccessTo.includes('admin_pass_config')) {
          tab = 'passconfig';
        } else if (availableAccessTo.includes('admin_accounts')) {
          tab = 'accounts';
        }
        this.router.navigate(['/admin', tab]);
        window.appLoaded();
    });


  }
  onReloadPage(event) {
    this.adminPageReload$.next(true);
  }

  hideOutlet(event: boolean) {
    this.outletDummySwitcher$.next(event);
  }

}
