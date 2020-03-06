import { Injectable, NgZone } from '@angular/core';
import {BehaviorSubject, Observable, of, ReplaySubject} from 'rxjs';
import {delay, filter, map, take, tap} from 'rxjs/operators';
import { GoogleAuthService } from './google-auth.service';
import { StorageService } from './storage.service';
import AuthResponse = gapi.auth2.AuthResponse;
import GoogleAuth = gapi.auth2.GoogleAuth;
import GoogleApi = gapi.auth2;
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

declare const window;


const STORAGE_KEY = 'google_auth';


export interface DemoLogin {
  username: string;
  password: string;
  invalid?: boolean;
  type: 'demo-login';
}

export interface Gg4lLogin {
  gg4l_token: string;
  type: 'gg4l-login';
}

export interface GG4LResponse {
  code: string;
}


export function isDemoLogin(d: any): d is DemoLogin {
  return (<DemoLogin>d).type === 'demo-login';
}

export function isGg4lLogin(d: any): d is Gg4lLogin {
  return (<Gg4lLogin>d).type === 'gg4l-login';
}

type AuthObject = AuthResponse | DemoLogin | Gg4lLogin;

@Injectable()
export class GoogleLoginService {

  private googleAuthTool = new BehaviorSubject<GoogleAuth>(null);

  private authToken$ = new BehaviorSubject<AuthObject>(null);

  public showLoginError$ = new BehaviorSubject(false);
  public isAuthenticated$ = new ReplaySubject<boolean>(1);
  // public isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(
    private googleAuth: GoogleAuthService,
    private _zone: NgZone,
    private storage: StorageService
  ) {
    this.authToken$.subscribe(auth => {
      if (auth) {
        const storageKey = isDemoLogin(auth)
                           ? JSON.stringify({username: (auth as DemoLogin).username, type: (auth as DemoLogin).type})
                           :
                           JSON.stringify(auth);
        this.storage.setItem(STORAGE_KEY, storageKey);
      }
    });

    this.googleAuth.getAuth().subscribe(auth => {
      this.googleAuthTool.next(auth as any);
    });

    // this.googleAuthTool.subscribe(tool =>
    //   console.log('google auth tool: ', tool, 'user currently signed in: ', tool ? tool.isSignedIn.get() : null));

    this.googleAuthTool
      .pipe(
        filter(e => !!e),
        take(1)
      )
      .subscribe(auth => {
        if (!auth.isSignedIn.get()) {
          return;
        }
        const resp = auth.currentUser.get().getAuthResponse();
        if (resp.expires_at > Date.now()) {
          this.updateAuth(resp);
        }
      });


    const savedAuth = this.storage.getItem(STORAGE_KEY);
    if (savedAuth) {
      console.log('Loading saved auth:', savedAuth);
      const auth: AuthResponse = JSON.parse(savedAuth);
      if (auth.id_token !== undefined || isDemoLogin(auth) || isGg4lLogin(auth)) {
        this.updateAuth(auth);
      } else {
        this.isAuthenticated$.next(false);
      }
    } else {
      this.isAuthenticated$.next(false);
    }

  }

  public get GoogleOauth() {

    const auth = this.googleAuthTool.value;

    if (!auth) {
      console.error('Auth not loaded!');
      return;
    } else {
      return auth;
    }
  }

  isAuthLoaded(): Observable<boolean> {
    return this.googleAuthTool.pipe(map(tool => tool !== null));
  }

  private needNewToken(): boolean {
    if (!this.authToken$.value) {
      return true;
    }

    if (isDemoLogin(this.authToken$.value)) {
      return !!this.authToken$.value.invalid;
    }

    if (isGg4lLogin(this.authToken$.value)) {
      return false;
    }

    const threshold = 5 * 60 * 1000; // 5 minutes
    // don't use TimeService for auth because auth is required for time service
    // to be useful
    return this.authToken$.value.expires_at <= Date.now() + threshold;
  }

  getIdToken(): Observable<DemoLogin | Gg4lLogin | string> {
    if (this.needNewToken()) {
      this.authToken$.next(null);
      this.isAuthenticated$.next(false);
      this.storage.removeItem(STORAGE_KEY);
    }

    return this.authToken$.pipe(
      filter(t => !!t && (!isDemoLogin(t) || !t.invalid)),
      map(a => {
        return (isDemoLogin(a) || isGg4lLogin(a)) ? a : a.id_token;
      })
    );
  }

  public updateAuth(auth: AuthObject) {
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
    this.storage.removeItem('refresh_token');
    this.logout();
  }

  simpleSignOn(code: string) {
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
    const auth: any = this.GoogleOauth;

    if (!auth) {
      console.error('Auth not loaded!');
      return;
    }

    return auth.signIn({ login_hint: userEmail }).then(user => {
      this._zone.run(() => {
        console.log(user.getAuthResponse());
        this.updateAuth(user.getAuthResponse());
      });
    });

  }

  signInDemoMode(username: string, password: string) {
    this.authToken$.next({username: username, password: password, type: 'demo-login'});
  }

  logout() {
    const auth = this.googleAuthTool.getValue();
    if (auth === null) {
      return;
    }

    const user = auth.currentUser.get();
    if (user) {
      user.disconnect();
      auth.signOut();
    }

  }

}
