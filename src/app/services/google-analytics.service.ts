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
          gtag('event', 'sign_in', {
            'send_to': 'public',
            'page_path': event.urlAfterRedirects,
            'event_callback': function (key) {}
          });
        } else {
          gtag('event', 'other', {
            'send_to': 'private',
            'page_path': event.urlAfterRedirects,
            'event_callback': function (key) {}
          });
        }
      }
    });
  }
}
