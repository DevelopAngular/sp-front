import { Injectable, NgZone } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/take';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { ReplaySubject } from 'rxjs';
import { GoogleAuthService } from './google-auth.service';
import AuthResponse = gapi.auth2.AuthResponse;
import GoogleAuth = gapi.auth2.GoogleAuth;
import {StorageService} from './storage.service';

const STORAGE_KEY = 'google_auth';

export interface DemoLogin {
  username: string;
  password: string;
  invalid?: boolean;
  type: 'demo-login';
}

export function isDemoLogin(d: any): d is DemoLogin {
  return (<DemoLogin>d).type === 'demo-login';
}

type AuthObject = AuthResponse | DemoLogin;

@Injectable()
export class GoogleLoginService {

  private googleAuthTool = new BehaviorSubject<GoogleAuth>(null);

  private authToken$ = new BehaviorSubject<AuthObject>(null);

  public showLoginError$ = new BehaviorSubject(false);
  public isAuthenticated$ = new ReplaySubject<boolean>(1);

  constructor(
      private googleAuth: GoogleAuthService,
      private _zone: NgZone,
      private storage: StorageService
  ) {

    this.authToken$.subscribe(auth => {
      // console.log('Loaded auth response:', auth);

      if (auth) {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(auth));
      }
    });

    this.googleAuth.getAuth().subscribe(auth => this.googleAuthTool.next(auth));

    const savedAuth = this.storage.getItem(STORAGE_KEY);
    if (savedAuth) {
      // console.log('Loading saved auth:', savedAuth);
      const auth: AuthResponse = JSON.parse(savedAuth);
      if (auth.id_token !== undefined || isDemoLogin(auth)) {
        this.updateAuth(auth);
      } else {
        this.isAuthenticated$.next(false);
      }
    } else {
      this.isAuthenticated$.next(false);
    }

  }

  isAuthLoaded(): Observable<boolean> {
    return this.googleAuthTool.map(tool => tool !== null);
  }

  private needNewToken(): boolean {
    if (!this.authToken$.value) {
      return true;
    }

    if (isDemoLogin(this.authToken$.value)) {
      return !!this.authToken$.value.invalid;
    }

    const threshold = 5 * 60 * 1000; // 5 minutes
    // don't use TimeService for auth because auth is required for time service
    // to be useful
    return this.authToken$.value.expires_at <= Date.now() + threshold;
  }

  getIdToken(): Observable<DemoLogin | string> {

    if (this.needNewToken()) {
      this.authToken$.next(null);
      this.isAuthenticated$.next(false);
      this.storage.removeItem(STORAGE_KEY);
    }

    return this.authToken$
      .filter(t => !!t && (!isDemoLogin(t) || !t.invalid))
      .take(1)
      .map(a => isDemoLogin(a) ? a : a.id_token);
  }

  private updateAuth(auth: AuthResponse | DemoLogin) {
    this.authToken$.next(auth);
  }

  setAuthenticated() {
    // console.log('setAuthenticated()');
    this.isAuthenticated$.next(true);
    this.showLoginError$.next(false);
  }

  clearInternal(permanent: boolean = false) {
    this.authToken$.next(null);

    if (!permanent) {
      this.isAuthenticated$.next(false);
    }

    this.storage.removeItem(STORAGE_KEY);
  }

  /**
   * This method will trigger the Google authentication pop-up.
   *
   * Some browsers (Chrome) having strict rules about when a popup can be triggered including
   * that the triggering of the popup happens during an actual click event. This makes it impossible
   * to use RxJS' subscribe() behavior and is the reason for some of the weirder construction of this
   * method.
   */
  public signIn() {
    const auth = this.googleAuthTool.value;

    if (!auth) {
      console.error('Auth not loaded!');
      return;
    }

    // console.log('logging in...');

    return auth.signIn().then(user => {
      this._zone.run(() => {
        console.log(user);
        this.updateAuth(user.getAuthResponse());
      });
    });

  }

  signInDemoMode(username: string, password: string) {
    this.authToken$.next({username: username, password: password, type: 'demo-login'});
  }

}
