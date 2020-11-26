import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable, NgZone} from '@angular/core';
import {Store} from '@ngrx/store';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {BehaviorSubject, interval, Observable, of, ReplaySubject, throwError} from 'rxjs';
import {catchError, delay, distinctUntilChanged, filter, first, flatMap, map, mapTo, mergeMap, switchMap, tap} from 'rxjs/operators';
import {BUILD_DATE, RELEASE_NAME} from '../../build-info';
import {environment} from '../../environments/environment';
import {School} from '../models/School';
import {AppState} from '../ngrx/app-state/app-state';
import {getSchools} from '../ngrx/schools/actions';
import {getCurrentSchool, getLoadedSchools, getSchoolsCollection, getSchoolsLength} from '../ngrx/schools/states';
import {GoogleLoginService, isDemoLogin, isGg4lLogin} from './google-login.service';
import {StorageService} from './storage.service';
import {SafeHtml} from '@angular/platform-browser';

export const SESSION_STORAGE_KEY = 'accessToken';

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

function makeConfig(config: Config, access_token: string, school: School, effectiveUserId): Config & { responseType: 'json' } {

  const headers: any = {
    'Authorization': 'Bearer ' + access_token,
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
  token?: any;
}

export interface AuthContext {
  server: LoginServer;
  auth: ServerAuth;
  gg4l_token?: string;
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
export class HttpService {

  public errorToast$: ReplaySubject<SPError> = new ReplaySubject(1);
  public schoolSignInRegisterText$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  private accessTokenSubject: BehaviorSubject<AuthContext> = new BehaviorSubject<AuthContext>(null);
  public effectiveUserId: BehaviorSubject<number> = new BehaviorSubject(null);
  public schools$: Observable<School[]> = this.loginService.isAuthenticated$.pipe(
    filter(v => v),
    switchMap(() => {
      return this.getSchoolsRequest();
    }),
    switchMap(() => this.schoolsCollection$)
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
    distinctUntilChanged(),
    delay(5)
  );

  private hasRequestedToken = false;

  constructor(
    private http: HttpClient,
    private loginService: GoogleLoginService,
    private storage: StorageService,
    private pwaStorage: LocalStorage,
    private store: Store<AppState>,
    private _zone: NgZone
  ) {

    // the school list is loaded when a user authenticates and we need to choose a current school of the school array.
    // First, if there is a current school loaded, try to use that one.
    // Then, if there is a school id saved in local storage, try to use that.
    // Last, choose a school arbitrarily.
    this.schools$.pipe(filter(schools => !!schools.length)).subscribe(schools => {
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

    interval(10000)
      .pipe(
        switchMap(() => of(this.accessTokenSubject.value)),
        filter(v => !!v),
        switchMap(({auth, server}) => {
          if ((new Date(auth.expires).getTime() + (auth.expires_in * 1000)) < Date.now()) {
            const authType = this.storage.getItem('authType');
            if (authType === 'password') {
              const config = new FormData();
              config.append('client_id', server.client_id);
              config.append('grant_type', 'refresh_token');
              config.append('token', auth.refresh_token);

              return this.http.post(makeUrl(server, 'o/token/'), config).pipe(
                map((data: any) => {
                  // don't use TimeService for auth because auth is required for time service
                  // to be useful
                  data['expires'] = new Date(new Date() + data['expires_in']);

                  ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);
                  const updatedAuthContext: AuthContext = {auth: data as ServerAuth, server: server} as AuthContext;
                  this.storage.setItem('refresh_token', updatedAuthContext.auth.refresh_token);
                  this.accessTokenSubject.next(updatedAuthContext);
                }),
                catchError((err) => {
                  this.loginService.isAuthenticated$.next(false);
                  return of(null);
                })
              );
            } else if (authType === 'google') {
              this.loginService.updateGoogleToken();
              return of(null);
            } else if (authType === 'gg4l') {
              const refresh_token = this.storage.getItem('refresh_token');
              const c = new FormData();
              c.append('refresh_token', refresh_token);
              c.append('grant_type', 'refresh_token');
              return this.http.post('https://sso.gg4l.com/oauth/token', c, {
                headers: new HttpHeaders({
                  'Authorization': 'Basic UFRSRE5VQkdEWDp6U0VrMlFpNFVkS1dkYlJqOFpZVWtnSitic2xLOUo1RERQeHZtTWJKZCtnPQ=='
                })
              });
            }
          } else {
            return of(null);
          }
        }),
      ).subscribe((res) => {
        // console.log('GG4L refresh', res);
    });

    this.kioskTokenSubject$.pipe(
      filter(v => !!v),
      map(newToken => {
        newToken['expires'] = new Date(new Date() + newToken['expires_in']);
        return {auth: newToken, server: this.accessTokenSubject.value.server};

      })).subscribe(res => {
      this.accessTokenSubject.next(res as AuthContext);
    });

  }

  get accessToken(): Observable<AuthContext> {
    if (!this.hasRequestedToken) {
      this.fetchServerAuth()
        .subscribe((auth: AuthContext) => {
          this.accessTokenSubject.next(auth);
        });

      this.hasRequestedToken = true;
    }

    return this.accessTokenSubject.pipe(filter(e => !!e));
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

          if (servers.token && servers.token.auth_token) {
            gg4l_token = servers.token.auth_token;
            if (servers.token.refresh_token) {
              this.storage.setItem('refresh_token', servers.token.refresh_token);
            }
          }

          if (this.storage.getItem('authType') === 'clever' && servers.token && servers.token.access_token) {
            clever_token = servers.token.access_token;
          }

          return { server, gg4l_token, clever_token };
        } else {
          return null;
        }
      })
    );
  }

  private loginManual(username: string, password: string): Observable<AuthContext> {
    const c = new FormData();
    c.append('email', username);
    c.append('platform_type', 'web');

    return this.getLoginServers(c).pipe(flatMap((response: LoginChoice) => {
      const server = response.server;
      if (server === null) {
        return throwError(new LoginServerError('No login server!'));
      }

      // console.log(`Chosen server: ${server.name}`, server);

      const config = new FormData();
      const refreshToken = this.storage.getItem('refresh_token');

      config.append('client_id', server.client_id);

      if (refreshToken) {
        config.append('grant_type', 'refresh_token');
        config.append('token', refreshToken);
      } else {
        config.append('grant_type', 'password');
        config.append('username', username);
        config.append('password', password);
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
          }),

          catchError((err) => {
            this.loginService.isAuthenticated$.next(false);
            return of(null);
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
        }),
        catchError((err) => {
          this.loginService.isAuthenticated$.next(false);
          return of(null);
        })
      );

    }));
  }

  private loginGoogleAuth(googleToken: string): Observable<AuthContext> {
    // console.log('loginGoogleAuth()');

    const c = new FormData();
    c.append('token', googleToken);
    c.append('provider', 'google-auth-token');
    c.append('platform_type', 'web');

    return this.getLoginServers(c).pipe(flatMap((response: LoginChoice) => {
      const server = response.server;
      if (server === null) {
        return throwError(new LoginServerError('No login server!'));
      }

      const config = new FormData();

      config.append('client_id', server.client_id);
      config.append('provider', 'google-auth-token');
      config.append('token', googleToken);

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

    return this.getLoginServers(c).pipe(flatMap((response: LoginChoice) => {
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

  loginClever(code: string): Observable<AuthContext> {

    const c = new FormData();
    c.append('code', code);
    c.append('provider', 'clever');
    c.append('platform_type', 'web');
    c.append('redirect_uri', 'https://smartpass-feature.lavanote.com/app');

    return this.getLoginServers(c).pipe(mergeMap((response: LoginChoice) => {
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

          return { auth: auth, server: server } as AuthContext;
        }));

    }));
  }

  private fetchServerAuth(retryNum: number = 0): Observable<AuthContext> {
    return this.loginService.getIdToken().pipe(
      switchMap((googleToken: any) => {
        let authContext$: Observable<AuthContext>;
        if (isDemoLogin(googleToken)) {
          authContext$ = this.loginManual(googleToken.username, googleToken.password);
        } else if (isGg4lLogin(googleToken)) {
          authContext$ = this.loginGG4L(googleToken.gg4l_token);
        } else {
          authContext$ = this.loginGoogleAuth(googleToken);
        }
        return authContext$.pipe(
          tap((res) => {
            if (!res) {
              throw new LoginServerError('Incorrect Login or password');
            }
            this.loginService.setAuthenticated();
          }),
          catchError(err => {
            if (err instanceof LoginServerError || err.status === 401 || err.status === 400) {
              if (isDemoLogin(googleToken)) {
                googleToken.invalid = true;
              }
              this.loginService.clearInternal(true);
              this.loginService.showLoginError$.next(true);
              return this.fetchServerAuth(retryNum + 1);
            }
            throw err;
          }));
      }));
  }

  private performRequest<T>(predicate: (ctx: AuthContext) => Observable<T>): Observable<T> {
    return this.accessToken.pipe(
      switchMap(ctx => {
        return predicate(ctx);
      }),
      catchError(err => {
        if (err.status !== 401) {
          throw err;
        }
        // invalidate the existing token
        this.accessTokenSubject.next(null);
        // const google_token = localStorage.getItem(SESSION_STORAGE_KEY); // TODO something more robust
        return this.fetchServerAuth().pipe(
          switchMap((ctx: AuthContext) => {
            // console.log('auth:', ctx);
            this.accessTokenSubject.next(ctx);
            return predicate(ctx);
          }));
      }),
      first());
  }

  clearInternal() {
    this.accessTokenSubject.next(null);
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
      return this.http.get<T>(makeUrl(ctx.server, url), makeConfig(config, ctx.auth.access_token, school, this.getEffectiveUserId()));
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
      makeConfig(config, ctx.auth.access_token, this.getSchool(), this.getEffectiveUserId())));
  }

  delete<T>(url, config?: Config): Observable<T> {
    return this.performRequest(ctx => this.http.delete<T>(makeUrl(ctx.server, url),
      makeConfig(config, ctx.auth.access_token, this.getSchool(), this.getEffectiveUserId())));
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
      makeConfig(config, ctx.auth.access_token, this.getSchool(), this.getEffectiveUserId())));
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
      makeConfig(config, ctx.auth.access_token, this.getSchool(), this.getEffectiveUserId())));
  }

}
