import { Component, NgZone, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { GoogleLoginService } from './google-login.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter, map, mergeMap} from 'rxjs/operators';
import {DeviceDetection} from './device-detection.helper';
import {BehaviorSubject} from 'rxjs';
import {HttpService} from './http-service';
import {School} from './models/School';

/**
 * @title Autocomplete overview
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  public isAuthenticated = false;
  public hideScroll: boolean = false;
  public showUI: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public schools: School[];

  constructor(
    public loginService: GoogleLoginService,
    private http: HttpService,
    private _zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private router: Router, private location: Location,
  ) {
  }

  ngOnInit() {
    if ( !DeviceDetection.isIOSTablet() && !DeviceDetection.isMacOS() ) {
      const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', './assets/css/custom_scrollbar.css');
            document.head.appendChild(link);
    }

    this.loginService.isAuthenticated$.subscribe(t => {

      // console.log('Auth response ===>', t);

      this._zone.run(() => {
        this.showUI.next(true);
        this.isAuthenticated = t;
        if (this.isAuthenticated) {
          this.http
            .get<School[]>('v1/schools')
            .subscribe((schools: School[]) => {
              console.log(schools);
              this.schools = schools;
              this.http.schoolIdSubject.next(this.schools[0]);
              //console.log(this.http.schoolIdSubject.value);
            });
        }
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
        // console.log(data);
        this.hideScroll = data.hideScroll;
      });
  }


}
