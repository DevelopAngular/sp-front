import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

declare const gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  constructor(private router: Router) {}

  init() {
    this.listenForRouteChanges();
  }

  private listenForRouteChanges() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects.includes('/school_signup?key') || event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/admin/gettingstarted') {
          gtag('config', 'UA-119610218-1', {
            'page_path': event.urlAfterRedirects,
          });
        } else {
          gtag('config', 'G-5NCCB9C2PJ', {
            'page_path': event.urlAfterRedirects,
          });
        }
      }
    });
  }
}
