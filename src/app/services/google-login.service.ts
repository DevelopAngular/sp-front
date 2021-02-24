import {Inject, Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, from, Observable, ReplaySubject, Subject} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';
import {StorageService} from './storage.service';
import { APP_BASE_HREF } from '@angular/common';

declare const window;


const STORAGE_KEY = 'google_auth';


export interface DemoLogin {
  username: string;
  password?: string;
  invalid?: boolean;
  kioskMode: boolean;
  type: 'demo-login';
}

export interface Gg4lLogin {
  gg4l_code: string;
  type: 'gg4l-login';
}

export interface CleverLogin {
  clever_code: string;
  type: 'clever-login';
}

export interface GoogleLogin {
  google_code: string;
  type: 'google-login';
}


export function isDemoLogin(d: any): d is DemoLogin {
  return (<DemoLogin>d).type === 'demo-login';
}

export function isGg4lLogin(d: any): d is Gg4lLogin {
  return (<Gg4lLogin>d).type === 'gg4l-login';
}

export function isCleverLogin(d: any): d is CleverLogin {
  return (<CleverLogin>d).type === 'clever-login';
}

export function isGoogleLogin(d: any): d is GoogleLogin {
  return (<GoogleLogin>d).type === 'google-login';
}

type AuthObject = GoogleLogin | DemoLogin | Gg4lLogin | CleverLogin;

enum OAuthType {
  google = 'google',
}

@Injectable()
export class GoogleLoginService {

  static googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=560691963710-220tggv4d3jo9rpc3l70opj1510keb59.apps.googleusercontent.com&response_type=code&access_type=offline&scope=profile%20email%20openid`

  private authObject$ = new BehaviorSubject<AuthObject>(null);

  public showLoginError$ = new BehaviorSubject(false);
  public loginErrorMessage$: Subject<string> = new Subject<string>();
  public isAuthenticated$ = new ReplaySubject<boolean>(1);
  // public isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(
      @Inject(APP_BASE_HREF)
      private baseHref: string,
      private _zone: NgZone,
      private storage: StorageService
  ) {
    if (baseHref === '/app') {
      this.baseHref = '/app/';
    }
    this.authObject$.subscribe(auth => {
      if (auth) {
        const storageKey = isDemoLogin(auth)
                           ? JSON.stringify({username: (auth as DemoLogin).username, type: (auth as DemoLogin).type})
                           :
                           JSON.stringify(auth);
        this.storage.setItem(STORAGE_KEY, storageKey);
      }
    });

    const savedAuth = this.storage.getItem(STORAGE_KEY);
    if (savedAuth) {
      console.log('Loading saved auth:', savedAuth);
      const auth = JSON.parse(savedAuth);
      if (isGoogleLogin(auth) || isDemoLogin(auth) || isGg4lLogin(auth) || isCleverLogin(auth)) {
        this.updateAuth(auth);
      } else {
        this.isAuthenticated$.next(false);
      }
    } else {
      this.isAuthenticated$.next(false);
    }

  }

  // Returns authObject
  getAuthObject(): Observable<AuthObject> {
    return this.authObject$.pipe(
      filter(t => !!t)
    );
  }

  public updateAuth(auth: AuthObject) {
    this.authObject$.next(auth);
  }

  clearInternal(permanent: boolean = false) {
    this.authObject$.next(null);

    if (!permanent) {
      this.isAuthenticated$.next(false);
    }

    this.storage.removeItem(STORAGE_KEY);
    this.storage.removeItem('refresh_token');
    this.storage.removeItem('google_id_token');
    this.storage.removeItem('context');
    this.storage.removeItem('kioskToken');
    this.logout();
  }

  /**
   * This method will trigger the Google authentication pop-up.
   *
   * Some browsers (Chrome) having strict rules about when a popup can be triggered including
   * that the triggering of the popup happens during an actual click event. This makes it impossible
   * to use RxJS' subscribe() behavior and is the reason for some of the weirder construction of this
   * method.
   */

  public signIn(userEmail?: string) {
    // TODO IMPLEMENT THIS
    let url = GoogleLoginService.googleOAuthUrl + `&redirect_uri=${this.getRedirectUrl()}google_oauth`;
    if (userEmail) {
      url = url + `&login_hint=${userEmail}`;
    }
    window.location.href = url;
  }

  getRedirectUrl(): string {
    const url = [window.location.protocol, '//', window.location.host, this.baseHref].join('');
    return url;
  }

  signInDemoMode(username: string, password: string) {
    this.authObject$.next({username: username, password: password, type: 'demo-login', kioskMode: false});
  }

  logout() {
    // IMPLEMENT LOGOUT, not sure if this is needed.

  }

}
