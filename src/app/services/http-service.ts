
import {
    catchError,
    tap,
    first,
    delay,
    distinctUntilChanged,
    filter,
    flatMap,
    map,
    skip,
    switchMap,
    merge,
    take,
    withLatestFrom
} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {of, throwError, BehaviorSubject, Observable, timer, interval, ReplaySubject, Subject} from 'rxjs';
import { environment } from '../../environments/environment';
import { GoogleLoginService, isDemoLogin } from './google-login.service';
import { School } from '../models/School';
import {StorageService} from './storage.service';

import * as moment from 'moment';

export const SESSION_STORAGE_KEY = 'accessToken';

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

function getSchoolInArray(id: string|number, schools: School[]) {
  for (let i = 0; i < schools.length; i++) {
    if (Number(schools[i].id) === Number(id)) {
      return schools[i];
    }
  }
  return null;
}

function isSchoolInArray(id: string|number, schools: School[]) {
  return getSchoolInArray(id, schools) !== null;
}

function makeConfig(config: Config, access_token: string, school: School, effectiveUserId): Config & { responseType: 'json' } {

  const headers: any = {
    'Authorization': 'Bearer ' + access_token
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
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  } else {
    return server.api_root + endpoint;
  }
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

export interface AuthContext {
  server: LoginServer;
  auth: ServerAuth;
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

  public errorToast$: ReplaySubject<boolean> = new ReplaySubject(1);

  private accessTokenSubject: BehaviorSubject<AuthContext> = new BehaviorSubject<AuthContext>(null);
  public effectiveUserId: BehaviorSubject<number> = new BehaviorSubject(null);
  public schools$: Observable<School[]> = this.loginService.isAuthenticated$.pipe(
    filter(v => v),
    switchMap(() => {
      return this.get<School[]>('v1/schools', undefined, null);
    }),
  );
  public currentSchoolSubject = new BehaviorSubject<School>(null);
  public currentSchool$: Observable<School> = this.currentSchoolSubject.asObservable();
  public kioskTokenSubject$ = new Subject();

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
  ) {

    // the school list is loaded when a user authenticates and we need to choose a current school of the school array.
    // First, if there is a current school loaded, try to use that one.
    // Then, if there is a school id saved in local storage, try to use that.
    // Last, choose a school arbitrarily.
    this.schools$.subscribe(schools => {
      // console.log('Schools:', schools);

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
            // tap(console.log),
            filter(v => !!v),
            switchMap(({auth, server}) => {
              // console.log((new Date(Date.now() + auth.expires_in)), new Date());

              if ((new Date(auth.expires).getTime() + (auth.expires_in * 1000)) < (Date.now())) {
                  const config = new FormData();
                  const user = JSON.parse(this.storage.getItem('google_auth'));
                  config.append('client_id', server.client_id);
                  config.append('grant_type', 'refresh_token');
                  config.append('token', auth.refresh_token);
                  // config.append('username', user.username);
                  // config.append('password', user.password);
                  console.log(new Date(auth.expires));

                return this.http.post(makeUrl(server, 'o/token/'), config).pipe(
                  map((data: any) => {
                    // console.log('Auth data : ', data);
                    // don't use TimeService for auth because auth is required for time service
                    // to be useful
                    data['expires'] = new Date(new Date() + data['expires_in']);

                    ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);
                    const updatedAuthContext: AuthContext = {auth: data as ServerAuth, server: server} as AuthContext;
                    this.accessTokenSubject.next(updatedAuthContext);
                  }),
                  catchError((err) => {
                    this.loginService.isAuthenticated$.next(false);
                    return of(null);
                  })
                );                    // return this.fetchServerAuth();
              } else {
                return of(null);
              }
            }),
     ).subscribe(() => { });

      this.kioskTokenSubject$.pipe(map(newToken => {
        newToken['expires'] = new Date(new Date() + newToken['expires_in']);
        return { auth: newToken, server: this.accessTokenSubject.value.server};
      })).subscribe(res => {
        this.accessTokenSubject.next(res as AuthContext);
      });

    // this.accessTokenSubject.pipe(withLatestFrom(this.kioskTokenSubject$),
    //     map(([{auth, server}, newToken]) => {
    //       return {auth: newToken, server};
    //     }))
    //     .subscribe((updatedContext: AuthContext) => {
    //       debugger;
    //       this.accessTokenSubject.next(updatedContext);
    //     });

  }

  get accessToken(): Observable<AuthContext> {

    // console.log('get accessToken');

    if (!this.hasRequestedToken) {
      this.fetchServerAuth()
        .subscribe((auth: AuthContext) => {
          this.accessTokenSubject.next(auth);
        });

      this.hasRequestedToken = true;
    }

    return this.accessTokenSubject.pipe(filter(e => !!e));
  }

  private getLoginServers(data: FormData): Observable<LoginServer> {
    const preferredEnvironment = environment.preferEnvironment;

    if (preferredEnvironment && typeof preferredEnvironment === 'object') {
      return of(preferredEnvironment as LoginServer);
    }

    return this.http.post('https://smartpass.app/api/discovery/find', data).pipe(
      map((servers: LoginServer[]) => {
        // console.log(servers);
        if (servers.length > 0) {

          return servers.find(s => s.name === (preferredEnvironment as any)) || servers[0];
        } else {
          return null;
        }
      }));
  }

  private loginManual(username: string, password: string): Observable<AuthContext> {

    // console.log('loginManual()');

    const c = new FormData();
    c.append('email', username);
    c.append('platform_type', 'web');

    return this.getLoginServers(c).pipe(flatMap(server => {
      if (server === null) {
        return throwError(new LoginServerError('No login server!'));
      }

      // console.log(`Chosen server: ${server.name}`, server);

      const config = new FormData();

      config.append('client_id', server.client_id);
      config.append('grant_type', 'password');
      config.append('username', username);
      config.append('password', password);

      // console.log('loginManual()');
      return this.http.post(makeUrl(server, 'o/token/'), config).pipe(
        map((data: any) => {
          console.log('Auth data : ', data);
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

    return this.getLoginServers(c).pipe(flatMap(server => {
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

  private fetchServerAuth(retryNum: number = 0): Observable<AuthContext> {
    // console.log('fetchServerAuth');
    return this.loginService.getIdToken().pipe(
      switchMap(googleToken => {
        let authContext$: Observable<AuthContext>;

        // console.log('getIdToken');

        if (isDemoLogin(googleToken)) {
          authContext$ = this.loginManual(googleToken.username, googleToken.password);
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
        // console.log('performRequest');
        return predicate(ctx);
      }),
      catchError(err => {
        if (err.status !== 401) {
          throw err;
        }

        // console.log('performRequest');

        // invalidate the existing token
        this.accessTokenSubject.next(null);

        // const google_token = localStorage.getItem(SESSION_STORAGE_KEY); // TODO something more robust
        return this.fetchServerAuth().pipe(
          switchMap((ctx: AuthContext) => {
            console.log('auth:', ctx);
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
    if (school !== null) {
      this.storage.setItem('last_school_id', school.id);
    } else {
      this.storage.removeItem('last_school_id');
    }
    this.currentSchoolSubject.next(school);
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

  post<T>(url: string, body?: any, config?: Config): Observable<T> {
    if (body && !(body instanceof FormData)) {
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
    return this.performRequest(ctx => this.http.post<T>(makeUrl(ctx.server, url), body, makeConfig(config, ctx.auth.access_token, this.getSchool(), this.getEffectiveUserId())));
  }

  delete<T>(url, config?: Config): Observable<T> {
    return this.performRequest(ctx => this.http.delete<T>(makeUrl(ctx.server, url), makeConfig(config, ctx.auth.access_token, this.getSchool(), this.getEffectiveUserId())));
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
    return this.performRequest(ctx => this.http.put<T>(makeUrl(ctx.server, url), body, makeConfig(config, ctx.auth.access_token, this.getSchool(), this.getEffectiveUserId())));
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
    return this.performRequest(ctx => this.http.patch<T>(makeUrl(ctx.server, url), body, makeConfig(config, ctx.auth.access_token, this.getSchool(), this.getEffectiveUserId())));
  }

}
