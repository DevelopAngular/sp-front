import {HttpClient} from '@angular/common/http';
import {Inject, Injectable, NgZone, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {BehaviorSubject, iif, Observable, of, ReplaySubject, Subject, throwError} from 'rxjs';
import {catchError, delay, exhaustMap, filter, map, mapTo, mergeMap, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {BUILD_DATE, RELEASE_NAME} from '../../build-info';
import {environment} from '../../environments/environment';
import {School} from '../models/School';
import {AppState} from '../ngrx/app-state/app-state';
import {getSchools} from '../ngrx/schools/actions';
import {getCurrentSchool, getLoadedSchools, getSchoolsCollection, getSchoolsLength} from '../ngrx/schools/states';
import {GoogleLoginService, isCleverLogin, isDemoLogin, isGg4lLogin} from './google-login.service';
import {StorageService} from './storage.service';
import {SafeHtml} from '@angular/platform-browser';
import {MatDialog} from '@angular/material/dialog';
import {SignedOutToastComponent} from '../signed-out-toast/signed-out-toast.component';
import {Router} from '@angular/router';
import {APP_BASE_HREF} from '@angular/common';

declare const window;

export interface Config {
  [key: string]: any;
}

export interface ServerAuth {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  expires: Date;
  scope: string;
}

function ensureFields<T, K extends keyof T>(obj: T, keys: K[]) {
  for (const key of keys) {
    if (!obj.hasOwnProperty(key as string)) {
      throw new Error(`${key} not in ${obj}`);
    }
  }
}

function getSchoolInArray(id: string | number, schools: School[]) {
  for (let i = 0; i < schools.length; i++) {
    if (Number(schools[i].id) === Number(id)) {
      return schools[i];
    }
  }
  return null;
}

function isSchoolInArray(id: string | number, schools: School[]) {
  return getSchoolInArray(id, schools) !== null;
}

function makeConfig(config: Config, school: School, effectiveUserId): Config & { responseType: 'json' } {

  const headers: any = {
    'build-release-name': RELEASE_NAME,
    'build-date': BUILD_DATE,
  };

  if (school) {
    headers['X-School-Id'] = '' + school.id;
  }
  if (effectiveUserId) {
    // console.log(effectiveUserId);
    headers['X-Effective-User-Id'] = '' + effectiveUserId;
  }

  // console.log('[X-School-Id]: ', headers['X-School-Id'])
  // console.log('[Headers]: ', headers)
  // console.log('[Headers]: ', Object.assign({}, config || {}, {
  //   headers: headers,
  //   responseType: 'json',
  // }) as any);

  return Object.assign({}, config || {}, {
    headers: headers,
    responseType: 'json',
  }) as any;
}

function makeUrl(server: LoginServer, endpoint: string) {
  let url: string;

  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    url = endpoint;
  } else {
    if (/(proxy)/.test(environment.buildType)) {
      const proxyPath = new URL(server.api_root).pathname;
      url = proxyPath + endpoint;
    } else {
      // url = 'https://smartpass.app/api/prod-us-central' + endpoint;
      url = server.api_root + endpoint;
    }
  }
  return url;
}

export interface LoginServer {
  api_root: string;
  client_id: string;
  client_secret: string;
  domain: string;
  icon_url: string;
  icon_search_url: string;
  name: string;
  ws_url: string;
}

export interface LoginResponse {
  servers: LoginServer[];
  token?: {
    auth_token: string,
    refresh_token?: string
    access_token?: string
  };
}

export interface LoginChoice {
  server: LoginServer;
  gg4l_token?: string;
  clever_token?: string;
  google_token?: string;
  token?: any;
}

export interface AuthContext {
  server: LoginServer;
  auth: ServerAuth;
  gg4l_token?: string;
  clever_token?: string;
}

export interface SPError {
  header: string;
  message: string | SafeHtml;
}

class LoginServerError extends Error {
  constructor(msg: string) {
    super(msg);
    // required for instanceof to work properly
    Object.setPrototypeOf(this, LoginServerError.prototype);
  }
}

@Injectable()
export class HttpService implements OnDestroy {

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public errorToast$: ReplaySubject<SPError> = new ReplaySubject(1);
  public schoolSignInRegisterText$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  private _authContext: AuthContext = null;
  public authContext$: BehaviorSubject<AuthContext> = new BehaviorSubject<AuthContext>(null);

  public effectiveUserId: BehaviorSubject<number> = new BehaviorSubject(null);
  public schoolToggle$: Subject<School> = new Subject<School>();
  public schools$: Observable<School[]> = this.loginService.isAuthenticated$.pipe(
      filter(v => v),
      take(1),
      exhaustMap((v) => {
        return this.getSchoolsRequest();
      }),
      exhaustMap(() => this.schoolsCollection$.pipe(filter(s => !!s.length), take(1)))
  );
  public schoolsCollection$: Observable<School[]> = this.store.select(getSchoolsCollection);
  public schoolsLoaded$: Observable<boolean> = this.store.select(getLoadedSchools);
  public currentUpdateSchool$: Observable<School> = this.store.select(getCurrentSchool);
  public schoolsLength$: Observable<number> = this.store.select(getSchoolsLength);

  public currentSchoolSubject = new BehaviorSubject<School>(null);
  public currentSchool$: Observable<School> = this.currentSchoolSubject.asObservable();
  public kioskTokenSubject$ = new BehaviorSubject<any>(null);

  public globalReload$ = this.currentSchool$.pipe(
      filter(school => !!school),
      map(school => school ? school.id : null),
      delay(5),
  );

  private hasRequestedToken = false;

  constructor(
      @Inject(APP_BASE_HREF)
      private baseHref: string,
      private http: HttpClient,
      private loginService: GoogleLoginService,
      private storage: StorageService,
      private pwaStorage: LocalStorage,
      private store: Store<AppState>,
      private _zone: NgZone,
      private matDialog: MatDialog,
      private router: Router
  ) {

    if (baseHref === '/app') {
      this.baseHref = '/app/';
    }

    // the school list is loaded when a user authenticates and we need to choose a current school of the school array.
    // First, if there is a current school loaded, try to use that one.
    // Then, if there is a school id saved in local storage, try to use that.
    // Last, choose a school arbitrarily.
    this.schools$
        .pipe(
            takeUntil(this.destroyed$),
            filter(schools => !!schools.length),
        )
        .subscribe(schools => {
          console.log('this.schools$ updated');
          const lastSchool = this.currentSchoolSubject.getValue();
          if (lastSchool !== null && isSchoolInArray(lastSchool.id, schools)) {
            this.currentSchoolSubject.next(getSchoolInArray(lastSchool.id, schools));
            return;
          }

          const savedId = this.storage.getItem('last_school_id');
          if (savedId !== null && isSchoolInArray(savedId, schools)) {
            this.currentSchoolSubject.next(getSchoolInArray(savedId, schools));
            return;
          }
          if (schools.length > 0) {
            this.currentSchoolSubject.next(schools[0]);
            return;
          }
          this.currentSchoolSubject.next(null);
          return;
        });

    this.kioskTokenSubject$.pipe(
        takeUntil(this.destroyed$),
        filter(v => !!v),
        map(newToken => {
          newToken['expires'] = new Date(new Date() + newToken['expires_in']);
          return {auth: newToken, server: this.getAuthContext().server};
        })).subscribe(res => {
          this.setAuthContext(res);
    });

    // When HTTPService is being constructed, if the user is already signed in, then authObject will resolve immediately.
    // This creates a circular dependency for HTTPService in AccessTokenInterceptor.
    // We break the cycle, by setting a timeout on the binding here.
    setTimeout(() => {
      this.loginService.getAuthObject().pipe(
          takeUntil(this.destroyed$),
          switchMap(authObj => this.fetchServerAuth(authObj)),
          tap({next: errOrAuth => {
            if (!errOrAuth.auth) {
              // Next object is error
              this.loginService.isAuthenticated$.next(false);
              this.loginService.showLoginError$.next(true);
            }
          }}),
          filter(authObj => !!authObj && !!authObj.auth)
      ).subscribe({next: authCtx => {
          this.setAuthContext(authCtx);
          this.loginService.isAuthenticated$.next(true);
        }});
    });

    this.authContext$.pipe(
        takeUntil(this.destroyed$)
    ).subscribe({next: ctx => {
      if (ctx === null) {
        console.log('Auth CTX set to null');
      } else {
        console.log('Auth CTX updated');
      }
    }});
  }

  ngOnDestroy() {
    console.log('HttpService ngOnDestroy: cleaning up...');
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  // Used in AccessTokenInterceptor for token refresh and adding access token
  getAuthContext(): AuthContext {
    return this._authContext;
  }

  setAuthContext(ctx: AuthContext): void {
    this._authContext = ctx;
    this.authContext$.next(ctx);
  }

  dirtyAccessToken(): void {
    const ctx = this.getAuthContext();
    ctx.auth.access_token = ctx.auth.access_token + 'garbled';
    this._authContext = ctx; // Will not update websocket, but it's ok for testing.
  }

  private getLoginServers(data: FormData): Observable<LoginChoice> {
    const preferredEnvironment = environment.preferEnvironment;

    if (preferredEnvironment && typeof preferredEnvironment === 'object') {
      return of({ server: preferredEnvironment as LoginServer });
    }

    let servers$: Observable<LoginResponse>;
    if (!navigator.onLine) {
      // servers$ = this.pwaStorage.getItem('servers');
    } else {
      const discovery = /(proxy)/.test(environment.buildType) ? '/api/discovery/v2/find' : 'https://smartpass.app/api/discovery/v2/find';

      servers$ = this.http.post(discovery, data).pipe(
          switchMap((servers: LoginResponse) => {
            return this.pwaStorage.setItem('servers', servers)
                .pipe(mapTo(servers));
          })
      );
    }

    return servers$.pipe(
        map((servers: LoginResponse) => {
          if (servers.servers.length > 0) {
            const server: LoginServer = servers.servers.find(s => s.name === (preferredEnvironment as any)) || servers.servers[0];

            let gg4l_token: string;
            let clever_token: string;
            let google_token: string;

            const authType = this.storage.getItem('authType');

            if (servers.token) {
              if (authType === 'gg4l') {
                gg4l_token = servers.token.auth_token;
                if (servers.token.refresh_token) {
                  this.storage.setItem('refresh_token', servers.token.refresh_token);
                }
              } else if (authType === 'clever') {
                clever_token = servers.token.access_token;
              } else {
                google_token = servers.token.access_token;
              }
            }

            this.storage.setItem('context', JSON.stringify({ server, gg4l_token, clever_token, google_token }));

            return { server, gg4l_token, clever_token, google_token };
          } else {
            return null;
          }
        })
    );
  }

  private loginManual(username: string, password?: string): Observable<AuthContext> {
    const c = new FormData();
    c.append('email', username);
    c.append('platform_type', 'web');

    const context = this.storage.getItem('context');

    return iif(() => !!context, of(JSON.parse(context)), this.getLoginServers(c)).pipe(mergeMap((response: LoginChoice) => {
      const server = response.server;
      if (server === null) {
        return throwError(new LoginServerError('No login server!'));
      }

      // console.log(`Chosen server: ${server.name}`, server);

      const config = new FormData();
      config.append('client_id', server.client_id);

      if (password) {
        config.append('grant_type', 'password');
        config.append('username', username);
        config.append('password', password);
      } else {
        config.append('grant_type', 'refresh_token');
        const refreshToken = this.storage.getItem('refresh_token');
        config.append('token', refreshToken);
      }

      if (!navigator.onLine) {
        console.log('AUTHDATA OFFLINE');
        return this.pwaStorage.getItem('authData').pipe(
            map((data: any) => {
              if (data) {
                data['expires'] = new Date(new Date() + data['expires_in']);

                ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);

                const auth = data as ServerAuth;

                return {auth: auth, server: server} as AuthContext;
              }
            })
        );
      }

      return this.http.post(makeUrl(server, 'o/token/'), config).pipe(
          switchMap(data => {
            return this.pwaStorage.setItem('authData', data).pipe(mapTo(data));
          }),
          map((data: any) => {
            this.storage.setItem('refresh_token', data.refresh_token);
            // don't use TimeService for auth because auth is required for time service
            // to be useful
            data['expires'] = new Date(new Date() + data['expires_in']);

            ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);

            const auth = data as ServerAuth;

            return {auth: auth, server: server} as AuthContext;
          })
      );

    }));
  }

  private loginGoogle(code: string): Observable<AuthContext> {
    // console.log('loginGoogleAuth()');

    const c = new FormData();
    c.append('code', code);
    c.append('provider', 'google-oauth-code');
    c.append('platform_type', 'web');
    c.append('redirect_uri', this.getRedirectUrl() + 'google_oauth');

    const context = this.storage.getItem('context');

    return iif(() => !!context, of(JSON.parse(context)), this.getLoginServers(c)).pipe(mergeMap((response: LoginChoice) => {
      const server = response.server;
      if (server === null) {
        return throwError(new LoginServerError('No login server!'));
      }

      const config = new FormData();

      config.append('client_id', server.client_id);
      config.append('provider', 'google-access-token');
      config.append('token', response.google_token);

      return this.http.post(makeUrl(server, 'auth/by-token'), config).pipe(
          map((data: any) => {
            // don't use TimeService for auth because auth is required for time service
            // to be useful
            data['expires'] = new Date(new Date() + data['expires_in']);

            ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);

            const auth = data as ServerAuth;

            return {auth: auth, server: server} as AuthContext;
          }));

    }));
  }

  loginGG4L(code: string): Observable<AuthContext> {

    const c = new FormData();
    c.append('code', code);
    c.append('provider', 'gg4l-sso');
    c.append('platform_type', 'web');

    const context = this.storage.getItem('context');

    return iif(() => !!context, of(JSON.parse(context)), this.getLoginServers(c)).pipe(mergeMap((response: LoginChoice) => {
      const server = response.server;
      if (server === null) {
        return throwError(new LoginServerError('No login server!'));
      }

      const config = new FormData();

      config.append('client_id', server.client_id);
      config.append('provider', 'gg4l-sso');
      config.append('token', response.gg4l_token || '');

      return this.http.post(makeUrl(server, 'auth/by-token'), config).pipe(
          map((data: any) => {
            // don't use TimeService for auth because auth is required for time service
            // to be useful
            data['expires'] = new Date(new Date() + data['expires_in']);

            ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);

            const auth = data as ServerAuth;

            return {auth: auth, server: server, gg4l_token: response.gg4l_token} as AuthContext;
          }));
    }));
  }

  getRedirectUrl(): string {
    const url = [window.location.protocol, '//', window.location.host, this.baseHref].join('');
    return url;
  }

  getEncodedRedirectUrl(): string {
    const redirect = encodeURIComponent(this.getRedirectUrl());
    return redirect;
  }

  loginClever(code: string): Observable<AuthContext> {

    const c = new FormData();
    c.append('code', code);
    c.append('provider', 'clever');
    c.append('platform_type', 'web');
    c.append('redirect_uri', this.getRedirectUrl());

    const context = this.storage.getItem('context');

    return iif(() => !!context, of(JSON.parse(context)), this.getLoginServers(c)).pipe(mergeMap((response: LoginChoice) => {
      const server = response.server;
      if (server === null) {
        return throwError(new LoginServerError('No login server!'));
      }

      const config = new FormData();

      config.append('client_id', server.client_id);
      config.append('provider', 'clever');
      config.append('token', response.clever_token);
      return this.http.post(makeUrl(server, 'auth/by-token'), config).pipe(
          map((data: any) => {
            // don't use TimeService for auth because auth is required for time service
            // to be useful
            data['expires'] = new Date(new Date() + data['expires_in']);

            ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);

            const auth = data as ServerAuth;

            return { auth: auth, server: server, clever_token: response.clever_token } as AuthContext;
          }));

    }));
  }

  private fetchServerAuth(authObject: any): Observable<AuthContext | any> {
    let authContext$: Observable<AuthContext>;
    if (isDemoLogin(authObject)) {
      authContext$ = this.loginManual(authObject.username, authObject.password);
    } else if (isGg4lLogin(authObject)) {
      authContext$ = this.loginGG4L(authObject.gg4l_code);
    } else if (isCleverLogin(authObject)) {
      authContext$ = this.loginClever(authObject.clever_code);
    } else {
      authContext$ = this.loginGoogle(authObject.google_code);
    }
    return authContext$.pipe(
        catchError(err => {
          console.log('Failed to fetch serverAuth, err: ', err);
          return of(err);
        })
    );
  }

  private performRequest<T>(predicate: (ctx: AuthContext) => Observable<T>): Observable<T> {
    if (!this.getAuthContext()) {
      throw new Error('No authContext');
    }

    return predicate(this.getAuthContext());
    // return this.authContext.pipe(
    //     // Switching this from switchMap to concatMap, allows refreshAuthContext to complete successfully.
    //     // refreshAuthContext gets cancelled when authContextSubject.next is called, so it never completes!
    //     concatMap(ctx => {
    //       return predicate(ctx);
    //     }),
    //     first());
  }

  // Used in AccessTokenInterceptor to trigger refresh
  refreshAuthContext(): Observable<any> {
    const signOutCatch = catchError(err => {
      this.showSignBackIn().subscribe( _ => {
        this.router.navigate(['sign-out']);
      });
      this.loginService.isAuthenticated$.next(false);
      throw err;
    });

    const authType = this.storage.getItem('authType');
    const {auth, server} = this.getAuthContext();
    switch (authType) {
      case 'password':
        const config = new FormData();
        config.append('client_id', server.client_id);
        config.append('grant_type', 'refresh_token');
        config.append('token', auth.refresh_token);
        return this.http.post(makeUrl(server, 'o/token/'), config).pipe(
            tap({next: o => console.log('Received refresh object: ', o)}),
            tap({next: (data: Object) => {
              data['expires'] = new Date(new Date() + data['expires_in']);
              const updatedAuthContext: AuthContext = {auth: data as ServerAuth, server: server} as AuthContext;
              this.storage.setItem('refresh_token', updatedAuthContext.auth.refresh_token);
              this.setAuthContext(updatedAuthContext);
            }}),
            signOutCatch
        );
      case 'google':
        const url = GoogleLoginService.googleOAuthUrl + `&redirect_uri=${this.getRedirectUrl()}google_oauth`;
        this.showSignBackIn()
            .pipe(takeUntil(this.destroyed$))
            .subscribe( _ => {
              this.loginService.clearInternal(true);
              window.location.href = url;
            });
        throw new Error('Redirecting to google');
      case 'gg4l':
        this.showSignBackIn()
            .pipe(takeUntil(this.destroyed$))
            .subscribe(_ => {
          this.loginService.clearInternal(true);
          window.location.href = `https://sso.gg4l.com/oauth/auth?response_type=code&client_id=${environment.gg4l.clientId}&redirect_uri=${this.getRedirectUrl()}`;
        });
        throw new Error('Redirecting to gg4l');
      case 'clever':
        this.showSignBackIn()
            .pipe(takeUntil(this.destroyed$))
            .subscribe(_ => {
          this.loginService.clearInternal(true);
          const redirect = this.getEncodedRedirectUrl();
          window.location.href = `https://clever.com/oauth/authorize?response_type=code&redirect_uri=${redirect}&client_id=f4260ade643c042482a3`;
        });
        throw new Error('Redirecting to clever');
      default:
        throw new Error('Unknown authType');
    }
  }

  showSignBackIn(): Observable<any> {
    const ref = this.matDialog.open(SignedOutToastComponent, {
      panelClass: 'form-dialog-container-white',
      disableClose: true,
      backdropClass: 'white-backdrop',
      data: {}
    });
    return ref.afterClosed();
  }

  clearInternal() {
    this.setAuthContext(null);
    this.hasRequestedToken = false;
  }

  setSchool(school: School) {
    if (!!school && school.id) {
      this.storage.setItem('last_school_id', school.id);
    } else {
      this.storage.removeItem('last_school_id');
    }
    this.currentSchoolSubject.next(school);
  }

  getSchoolsRequest() {
    this.store.dispatch(getSchools());
    return of(null);
  }

  getSchools(): Observable<School[]> {
    return this.get('v1/schools');
  }

  getSchool() {
    return this.currentSchoolSubject.getValue();
  }

  getEffectiveUserId() {
    return this.effectiveUserId.getValue();
  }

  searchIcons(search: string, config?: Config) {
    return this.performRequest(ctx => {
      return this.http.get(`${ctx.server.icon_search_url}?query=${search}`);
    });
  }

  get<T>(url, config?: Config, schoolOverride?: School): Observable<T> {
    // console.log('Making request: ' + url);
    return this.performRequest(ctx => {
      // Explicitly check for undefined because the caller may want to override with null.
      const school = schoolOverride !== undefined ? schoolOverride : this.getSchool();
      return this.http.get<T>(makeUrl(ctx.server, url), makeConfig(config, school, this.getEffectiveUserId()));
    });
  }

  post<T>(url: string, body?: any, config?: Config, isFormData = true): Observable<T> {
    if (body && !(body instanceof FormData) && isFormData) {
      const formData: FormData = new FormData();
      for (const prop in body) {
        if (body.hasOwnProperty(prop)) {
          if (body[prop] instanceof Array) {
            for (const sprop of body[prop]) {
              formData.append(prop, sprop);
            }
          } else {
            formData.append(prop, body[prop]);
          }
        }
      }
      body = formData;
    }
    return this.performRequest(ctx => this.http.post<T>(makeUrl(ctx.server, url), body,
        makeConfig(config, this.getSchool(), this.getEffectiveUserId())));
  }

  delete<T>(url, config?: Config): Observable<T> {
    return this.performRequest(ctx => this.http.delete<T>(makeUrl(ctx.server, url),
        makeConfig(config, this.getSchool(), this.getEffectiveUserId())));
  }

  put<T>(url, body?: any, config?: Config): Observable<T> {
    const formData: FormData = new FormData();
    for (const prop in body) {
      if (body.hasOwnProperty(prop)) {
        if (body[prop] instanceof Array) {
          for (const sprop of body[prop]) {
            formData.append(prop, sprop);
          }
        } else {
          formData.append(prop, body[prop]);
        }
      }
    }
    return this.performRequest(ctx => this.http.put<T>(makeUrl(ctx.server, url), body,
        makeConfig(config, this.getSchool(), this.getEffectiveUserId())));
  }

  patch<T>(url, body?: any, config?: Config): Observable<T> {
    const formData: FormData = new FormData();
    for (const prop in body) {
      if (body.hasOwnProperty(prop)) {
        if (body[prop] instanceof Array) {
          for (const sprop of body[prop]) {
            formData.append(prop, sprop);
          }
        } else {
          formData.append(prop, body[prop]);
        }
      }
    }
    return this.performRequest(ctx => this.http.patch<T>(makeUrl(ctx.server, url), body,
        makeConfig(config, this.getSchool(), this.getEffectiveUserId())));
  }

}
