import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/switchMap';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { throwError } from 'rxjs/internal/observable/throwError';
import { Observable } from 'rxjs/Observable';
import { delay, flatMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GoogleLoginService, isDemoLogin } from './google-login.service';
import { School } from '../models/School';
import {StorageService} from './storage.service';

export const SESSION_STORAGE_KEY = 'accessToken';

export interface Config {
  [key: string]: any;
}

export interface ServerAuth {
  access_token: string;
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

function makeConfig(config: Config, access_token: string, school_id:School): Config & { responseType: 'json' } {

  // console.log('[school_id]: ', school_id)

  let headers:any = {'Authorization': 'Bearer ' + access_token}

  if(school_id){
    headers['X-School-Id'] = '' +school_id.id;
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

  private accessTokenSubject: BehaviorSubject<AuthContext> = new BehaviorSubject<AuthContext>(null);
  public schoolIdSubject: BehaviorSubject<School> = new BehaviorSubject<School>(null);
  public school: School = JSON.parse(this.storage.getItem('currentSchool'));


  public globalReload$ = this.schoolIdSubject.pipe(delay(5));

  private hasRequestedToken = false;

  constructor(
      private http: HttpClient,
      private loginService: GoogleLoginService,
      private storage: StorageService
  ) {

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

    return this.accessTokenSubject.filter(e => !!e);
  }

  private getLoginServers(data: FormData): Observable<LoginServer> {
    const preferredEnvironment = environment.preferEnvironment;

    if (preferredEnvironment && typeof preferredEnvironment === 'object') {
      return of(preferredEnvironment as LoginServer);
    }

    return this.http.post('https://smartpass.app/api/discovery/find', data)
      .map((servers: LoginServer[]) => {
        // console.log(servers);
        if (servers.length > 0) {
          return servers.find(s => s.name === (preferredEnvironment as any)) || servers[0];
        } else {
          return null;
        }
      });
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

      // console.log(`Chosen server: ${server.name}`);

      const config = new FormData();

      config.append('client_id', server.client_id);
      config.append('grant_type', 'password');
      config.append('username', username);
      config.append('password', password);

      // console.log('loginManual()');

      return this.http.post(makeUrl(server, 'o/token/'), config)
        .map((data: any) => {
          data['expires'] = new Date(new Date() + data['expires_in']);

          ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);

          const auth = data as ServerAuth;

          return {auth: auth, server: server} as AuthContext;
        });

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

      return this.http.post(makeUrl(server, 'auth/by-token'), config)
        .map((data: any) => {
          data['expires'] = new Date(new Date() + data['expires_in']);

          ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);

          const auth = data as ServerAuth;

          return {auth: auth, server: server} as AuthContext;
        });

    }));
  }

  private fetchServerAuth(retryNum: number = 0): Observable<AuthContext> {
    // console.log('fetchServerAuth');
    return this.loginService.getIdToken()
      .switchMap(googleToken => {
        let authContext$: Observable<AuthContext>;

        // console.log('getIdToken');

        if (isDemoLogin(googleToken)) {
          authContext$ = this.loginManual(googleToken.username, googleToken.password);
        } else {
          authContext$ = this.loginGoogleAuth(googleToken);
        }

        return authContext$
          .do(() => {
            this.loginService.setAuthenticated();
          })
          .catch(err => {
            if (err instanceof LoginServerError || err.status === 401) {
              if (isDemoLogin(googleToken)) {
                googleToken.invalid = true;
              }

              this.loginService.clearInternal(true);
              this.loginService.showLoginError$.next(true);
              return this.fetchServerAuth(retryNum + 1);
            }

            throw err;
          });

      });
  }

  private performRequest<T>(predicate: (ctx: AuthContext) => Observable<T>): Observable<T> {
    return this.accessToken
      .switchMap(ctx => predicate(ctx))
      .catch(err => {
        if (err.status !== 401) {
          throw err;
        }

        // console.log('performRequest');

        // invalidate the existing token
        this.accessTokenSubject.next(null);

        // const google_token = localStorage.getItem(SESSION_STORAGE_KEY); // TODO something more robust
        return this.fetchServerAuth()
          .switchMap((ctx: AuthContext) => {
            console.log('auth:', ctx);
            this.accessTokenSubject.next(ctx);
            return predicate(ctx);
          });
      })
      .first();
  }

  clearInternal() {
    this.accessTokenSubject.next(null);
    this.hasRequestedToken = false;
  }

  get<T>(url, config?: Config): Observable<T> {
    // console.log('Making request: ' + url);


    // if (this.school) {
    //
    // }
    // this.http.schoolIdSubject.next(JSON.parse(school));

    return this.performRequest(ctx => this.http.get<T>(makeUrl(ctx.server, url), makeConfig(config, ctx.auth.access_token, this.school)))
      .do(x => {
        // console.log('Finished request: ' + url, x);
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
    return this.performRequest(ctx => this.http.post<T>(makeUrl(ctx.server, url), body, makeConfig(config, ctx.auth.access_token, this.school)));
  }

  delete<T>(url, config?: Config): Observable<T> {
    return this.performRequest(ctx => this.http.delete<T>(makeUrl(ctx.server, url), makeConfig(config, ctx.auth.access_token, this.school)));
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
    return this.performRequest(ctx => this.http.put<T>(makeUrl(ctx.server, url), body, makeConfig(config, ctx.auth.access_token, this.school)));
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
    return this.performRequest(ctx => this.http.patch<T>(makeUrl(ctx.server, url), body, makeConfig(config, ctx.auth.access_token, this.school)));
  }

}
