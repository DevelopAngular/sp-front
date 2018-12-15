import { Injectable } from '@angular/core';
import { GoogleAuthService } from 'ng-gapi';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/take';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import AuthResponse = gapi.auth2.AuthResponse;
import GoogleAuth = gapi.auth2.GoogleAuth;

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

  public isAuthenticated$ = new ReplaySubject<boolean>(1);

  constructor(private googleAuth: GoogleAuthService) {

    this.authToken$.subscribe(auth => {
      console.log('Loaded auth response:', auth);

      if (auth) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
      }
    });

    this.googleAuth.getAuth().subscribe(auth => this.googleAuthTool.next(auth));

    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth) {
      const auth: AuthResponse = JSON.parse(savedAuth);
      this.updateAuth(auth);
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
    return this.authToken$.value.expires_at <= Date.now() + threshold;
  }

  getIdToken(): Observable<DemoLogin | string> {

    if (this.needNewToken()) {
      this.authToken$.next(null);
      this.isAuthenticated$.next(false);
    }

    return this.authToken$
      .filter(t => !!t)
      .take(1)
      .map(a => isDemoLogin(a) ? a : a.id_token);
  }

  private updateAuth(auth: AuthResponse) {
    this.authToken$.next(auth);
    this.isAuthenticated$.next(true);
  }

  clearInternal(permanent: boolean = false) {
    this.authToken$.next(null);

    if (!permanent) {
      this.isAuthenticated$.next(false);
    }

    localStorage.removeItem(STORAGE_KEY);
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

    console.log('logging in...');

    return auth.signIn().then(user => {
      console.log(user);
      this.updateAuth(user.getAuthResponse());
    });

  }

  signInDemoMode(username: string, password: string) {
    this.authToken$.next({username: username, password: password, type: 'demo-login'});
    this.isAuthenticated$.next(true);
  }

}
