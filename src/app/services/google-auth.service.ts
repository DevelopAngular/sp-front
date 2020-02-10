import { Injectable, NgZone } from '@angular/core';

import { of ,  Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { GoogleApiService } from './google-api.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  GoogleAuth = undefined;

  auth$: Subject<any> = null;

  constructor(private googleApi: GoogleApiService, private _zone: NgZone) {
    this.googleApi.onLoad().subscribe(() => {
      console.log('Google api loaded');
      this.loadGapiAuth().subscribe();
    });
  }

  getAuth() {

    return this.googleApi.onLoad().pipe(mergeMap(() => {
      return this.loadGapiAuth();
    }));
  }

  private loadGapiAuth() {
    if (this.auth$) {
      return this.auth$.pipe(take(1));
    }

    this.auth$ = new ReplaySubject(1);

    gapi.load('auth2', () => {

      gapi.auth2.init(this.googleApi.getConfig().getClientConfig()).then(auth => {
        this.GoogleAuth = auth;
        this._zone.run(() => {
          // console.log('Google auth api loaded', auth);
          this.auth$.next(auth);
        });
      }).catch(e => console.error(e));
    });

    return this.auth$.pipe(take(1));
  }

}
