import { Injectable, NgZone } from '@angular/core';

import { of } from 'rxjs';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { GoogleApiService } from './google-api.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  GoogleAuth = undefined;

  constructor(private googleApi: GoogleApiService, private _zone: NgZone) {
    this.googleApi.onLoad().subscribe(() => {
      this.loadGapiAuth();
    });
  }

  getAuth() {
    if (!this.GoogleAuth) {
      return this.googleApi.onLoad().pipe(mergeMap(() => {
        return this.loadGapiAuth();
      }));
    }
    return of(this.GoogleAuth);
  }

  loadGapiAuth() {
    return new Observable(ob => {
      gapi.load('auth2', () => {
        gapi.auth2.init(this.googleApi.getConfig().getClientConfig()).then(auth => {
          this.GoogleAuth = auth;
          this._zone.run(() => {
            ob.next(auth);
            ob.complete();
          });
        });
      });
    });
  }

}
