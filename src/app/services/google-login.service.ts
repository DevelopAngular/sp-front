import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, from, Observable, ReplaySubject, Subject} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';
import {GoogleAuthService} from './google-auth.service';
import {StorageService} from './storage.service';
import AuthResponse = gapi.auth2.AuthResponse;
import GoogleAuth = gapi.auth2.GoogleAuth;

declare const window;


const STORAGE_KEY = 'google_auth';


export interface DemoLogin {
  username: string;
  password: string;
  invalid?: boolean;
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

@Injectable()
export class GoogleLoginService {

  private googleAuthTool = new BehaviorSubject<GoogleAuth>(null);

  private authObject$ = new BehaviorSubject<AuthObject>(null);

  public showLoginError$ = new BehaviorSubject(false);
  public loginErrorMessage$: Subject<string> = new Subject<string>();
  public isAuthenticated$ = new ReplaySubject<boolean>(1);
  // public isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(
    private googleAuth: GoogleAuthService,
    private _zone: NgZone,
    private storage: StorageService
  ) {
    this.authObject$.subscribe(auth => {
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
        if (!auth.isSignedIn.get() && this.storage.getItem('authType') !== 'google') {
          return;
        }
        const resp = auth.currentUser.get().getAuthResponse();
        this.updateAuthObjectForGoogle(resp);
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

  public get GoogleOauth() {

    const auth = this.googleAuthTool.value;

    if (!auth) {
      console.error('Auth not loaded!');
      return;
    } else {
      return auth;
    }
  }

  updateAuthObjectForGoogle(resp: gapi.auth2.AuthResponse) {
    if (resp.expires_at > Date.now()) {
      this.storage.setItem('google_id_token', resp.id_token);
      this.updateAuth({type: 'google-login'} as GoogleLogin);
    }
  }

  isGoogleAuthLoaded(): Observable<boolean> {
    return this.googleAuthTool.pipe(map(tool => tool !== null));
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
    const auth: any = this.GoogleOauth;

    if (!auth) {
      this.storage.showError$.next(true);
      console.error('Auth not loaded!');
      return;
    }

    return auth.signIn({ login_hint: userEmail }).then(user => {
      this._zone.run(() => {
        console.log(user.getAuthResponse());
        this.updateAuthObjectForGoogle(user.getAuthResponse());
      });
    });

  }

  getNewGoogleAuthResponse(): Observable<AuthResponse> {
    const auth = this.googleAuthTool.getValue();
    const user = auth.currentUser.get();
    return from(user.reloadAuthResponse());
  }

  signInDemoMode(username: string, password: string) {
    this.authObject$.next({username: username, password: password, type: 'demo-login'});
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
