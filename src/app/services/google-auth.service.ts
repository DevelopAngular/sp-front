import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { mergeMap } from 'rxjs/operators';
import { GoogleApiService } from './google-api.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  GoogleAuth = undefined;

  constructor(private googleApi: GoogleApiService) {
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
    return Observable.of(this.GoogleAuth);
  }

  loadGapiAuth() {
    return Observable.create(ob => {
      gapi.load('auth2', () => {
        gapi.auth2.init(this.googleApi.getConfig().getClientConfig()).then(auth => {
          this.GoogleAuth = auth;
          ob.next(auth);
          ob.complete();
        });
      });
    });
  }

}
