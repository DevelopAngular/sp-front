import { Component, NgZone, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { GoogleLoginService } from './google-login.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter, map, mergeMap} from 'rxjs/operators';
import {DeviceDetection} from './device-detection.helper';
import {UserService} from './user.service';
import {HttpService} from './http-service';

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
    private router: Router, private location: Location,
    private userService: UserService,
    private httpService: HttpService
  ) {
  }

  ngOnInit() {
    if ( !DeviceDetection.isIOSTablet() && !DeviceDetection.isMacOS() ) {
      const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', './assets/css/custom_scrollbar.css');
            document.head.appendChild(link);
    }
    // console.log('Auth response ===>');
    // this.httpService.accessToken.subscribe((u) => {
    //   // this.isAuthenticated ;
    //   console.log('U ===============>', u);
    //   return ;
    // })
    this.loginService.isAuthenticated$.subscribe(t => {
      console.log('Auth response ===>', t);
      this._zone.run(() => {
        this.isAuthenticated = t;
      });
    });
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          if (route.firstChild) { route = route.firstChild; }
          return route;
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        console.log(data);
        this.hideScroll = data.hideScroll;
      });
  }


}
