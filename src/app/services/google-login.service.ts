import { Injectable, NgZone } from '@angular/core';
import {BehaviorSubject, Observable, of, ReplaySubject} from 'rxjs';
import {delay, filter, map, take, tap} from 'rxjs/operators';
import { GoogleAuthService } from './google-auth.service';
import { StorageService } from './storage.service';
import AuthResponse = gapi.auth2.AuthResponse;
import GoogleAuth = gapi.auth2.GoogleAuth;
import {AuthConfig, JwksValidationHandler, OAuthService} from 'angular-oauth2-oidc';
import {HttpClient} from '@angular/common/http';

declare const window;


const STORAGE_KEY = 'google_auth';


export interface DemoLogin {
  username: string;
  password: string;
  invalid?: boolean;
  type: 'demo-login';
}

export const authConfig: AuthConfig = {
  // issuer: `https://sso.gg4l.com`,
  loginUrl: `https://sso.gg4l.com/oauth/auth?response_type=code&client_id=PTRDNUBGDX&redirect_uri=${window.location.href}`,
  skipIssuerCheck: true,
  skipSubjectCheck: true,
  // dummyClientSecret: 'zSEk2Qi4UdKWdbRj8ZYUkgJ+bslK9J5DDPxvmMbJd+g=',
  openUri: (uri => window.open(uri, '_blank')),
  // oidc: false
// Url of the Identity Provider
  // issuer: 'https://steyer-identity-server.azurewebsites.net/identity',
  // issuer: `https://sso.gg4l.com/oauth/auth`,
  // responseType: 'code',
  // URL of the SPA to redirect the user to after login
  // redirectUri: window.location.origin + '/index.html',

  // The SPA's id. The SPA is registered with this id at the auth-server
  // clientId: 'PTRDNUBGDX',
  // scope: 'openid profile email offline_access api',
  // set the scope for the permissions the client should request
  // The first three are defined by OIDC. The 4th is a usecase-specific one
  // scope: 'openid profile email voucher',
}

// export const authConfig: AuthConfig = {
//
//   // Url of the Identity Provider
//   issuer: 'https://steyer-identity-server.azurewebsites.net/identity',
//
//   // URL of the SPA to redirect the user to after login
//   redirectUri: window.location.origin + '/index.html',
//
//   // The SPA's id. The SPA is registered with this id at the auth-server
//   clientId: 'spa-demo',
//
//   // set the scope for the permissions the client should request
//   // The first three are defined by OIDC. The 4th is a usecase-specific one
//   scope: 'openid profile email voucher',
// }

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
  // public isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(
    private googleAuth: GoogleAuthService,
    private oauthService: OAuthService,
    private _zone: NgZone,
    private storage: StorageService,
    private http: HttpClient
  ) {
    // this.configure();
    this.authToken$.subscribe(auth => {
      // window.waitForAppLoaded();
      if (auth) {
        const storageKey = isDemoLogin(auth)
                           ? JSON.stringify({username: (auth as DemoLogin).username, type: (auth as DemoLogin).type})
                           :
                           JSON.stringify(auth);
        this.storage.setItem(STORAGE_KEY, storageKey);
      }
    });

    this.googleAuth.getAuth().subscribe(auth => this.googleAuthTool.next(auth as any));

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

    return this.authToken$.pipe(
      filter(t => !!t && (!isDemoLogin(t) || !t.invalid)),
      take(1),
      map(a => isDemoLogin(a) ? a : a.id_token)
    );
  }

  public updateAuth(auth: AuthResponse | DemoLogin) {
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

  simpleSignOn() {
    // this.configure();
    // this.oauthService.initLoginFlow();
    //
    // of(null)
    //   .pipe(
    //     tap(() => {
    //     }),
    //     delay(1000),
    //   )
    //   .subscribe(() => {
    //   });
    // return this.http.get('https://sso.gg4l.com/oauth/auth?response_type=code&client_id=PTRDNUBGDX&redirect_uri=http://localhost:4200/')
    //   .toPromise();
    window.location.href = 'https://sso.gg4l.com/oauth/auth?response_type=code&client_id=PTRDNUBGDX&redirect_uri=http://localhost:4200';
    //  this.http.post('https://sso.gg4l.com/oauth/token?grant_type=authorization_code&code=WWfkg2&redirect_uri=http://localhost:4200', {
    //
    //  }, {
    //    headers: {
    //      'Authorization': `Basic ${window.btoa(`PTRDNUBGDX:zSEk2Qi4UdKWdbRj8ZYUkgJ+bslK9J5DDPxvmMbJd+g=`)}`,
    //      'Referer': 'https://sso.gg4l.com',
    //      'Origin': 'https://sso.gg4l.com',
    //      'Host': 'https://sso.gg4l.com',
    //    }
    //  }).subscribe((res) => {
    //    debugger
    //    console.log(res);
    //  });

    // const left = (window.innerWidth - 600) / 2;
    // const wRef = window.open('https://sso.gg4l.com/oauth/auth?response_type=code&client_id=PTRDNUBGDX&redirect_uri=http://localhost:4200', 'windowName', `width=600,height=840,left=${left},top=50`);

  }

  private configure() {
    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
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
    const auth = this.GoogleOauth;

    if (!auth) {
      console.error('Auth not loaded!');
      return;
    }

    // console.log('logging in...');

    return auth.signIn().then(user => {
      this._zone.run(() => {
        console.log(user.getAuthResponse());
        this.updateAuth(user.getAuthResponse());
      });
    });

  }

  signInDemoMode(username: string, password: string) {
    // window.waitForAppLoaded();
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
