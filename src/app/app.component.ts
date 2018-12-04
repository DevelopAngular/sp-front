import { Component, NgZone, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { GoogleLoginService } from './google-login.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter, map, mergeMap} from 'rxjs/operators';

/**
 * @title Autocomplete overview
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  isAuthenticated = false;
  public hideScroll: boolean = false;

  constructor(
    public loginService: GoogleLoginService,
    private _zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private router: Router, private location: Location
  ) {
  }

  ngOnInit() {
    this.loginService.isAuthenticated$.subscribe(t => {
      this._zone.run(() => {
        this.isAuthenticated = t;
      });
    });
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) { route = route.firstChild; }
          return route;
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        this.hideScroll = data.hideScroll;
      });
  }


}
