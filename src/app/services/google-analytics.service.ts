import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

declare const dataLayer;

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
          dataLayer.push({
            'event': 'sign_in',
            'send_to': 'public',
            'page_path': event.urlAfterRedirects
          });
        } else {
          dataLayer.push({
            'event': 'other',
            'send_to': 'private',
            'page_path': event.urlAfterRedirects
          });
        }
      }
    });
  }

  public emitEvent(name, params) {
    dataLayer.push({'event': name, ...params});
  }

}
