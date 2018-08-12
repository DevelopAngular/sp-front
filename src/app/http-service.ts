import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/switchMap';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../environments/environment';
import { GoogleLoginService } from './google-login.service';

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

function makeConfig(config: Config, access_token: string): Config & { responseType: 'json' } {
  return Object.assign({}, config || {}, {
    headers: {'Authorization': 'Bearer ' + access_token},
    responseType: 'json',
  }) as any;
}

function makeUrl(endpoint: string) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  } else {
    return environment.serverConfig.host + endpoint;
  }
}

@Injectable()
export class HttpService {

  private accessTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  private hasRequestedToken = false;

  constructor(private http: HttpClient,
              private loginService: GoogleLoginService) {

  }

  get accessToken(): Observable<string> {

    if (!this.hasRequestedToken) {
      this.fetchServerAuth()
        .subscribe((auth: ServerAuth) => {
          this.accessTokenSubject.next(auth.access_token);
        });

      this.hasRequestedToken = true;
    }

    return this.accessTokenSubject.filter(e => !!e);
  }

  private fetchServerAuth(): Observable<ServerAuth> {
    if (environment.serverConfig.auth_method === 'password') {
      if (environment.production) {
        throw Error('auth_method \'password\' must not be used in production.');
      }

      const config = new FormData();

      config.set('client_id', environment.serverConfig.client_id);
      config.set('grant_type', 'password');
      config.set('username', (environment.serverConfig as any).auth_username);
      config.set('password', (environment.serverConfig as any).auth_password);

      return this.http.post(makeUrl('o/token/'), config)
        .map((data: any) => {
          data['expires'] = new Date(new Date() + data['expires_in']);

          ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);

          return data as ServerAuth;
        });
    } else {
      return this.loginService.getIdToken()
        .switchMap(googleToken => {
          const config = new FormData();

          config.set('client_id', environment.serverConfig.client_id);
          config.set('provider', 'google-auth-token');
          config.set('token', googleToken);

          return this.http.post(makeUrl('auth/by-token'), config)
            .map((data: any) => {
              data['expires'] = new Date(new Date() + data['expires_in']);

              ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);

              return data as ServerAuth;
            });
        });
    }
  }

  private performRequest<T>(predicate: (string) => Observable<T>): Observable<T> {
    return this.accessToken
      .switchMap(token => predicate(token))
      .catch(err => {
        if (err.status !== 401) {
          throw err;
        }

        console.log('getting new token');

        // invalidate the existing token
        this.accessTokenSubject.next(null);

        // const google_token = localStorage.getItem(SESSION_STORAGE_KEY); // TODO something more robust
        return this.fetchServerAuth()
          .switchMap((auth: ServerAuth) => {
            this.accessTokenSubject.next(auth.access_token);
            return predicate(auth.access_token);
          });
      })
      .first();
  }

  clearInternal() {
    this.accessTokenSubject.next(null);
    this.hasRequestedToken = false;
  }

  get<T>(url, config?: Config): Observable<T> {
    console.log('Making request: ' + url);
    return this.performRequest(token => this.http.get<T>(makeUrl(url), makeConfig(config, token)))
      .do(x => {
        console.log('Finished request: ' + url, x);
      });
  }

  post<T>(url: string, body?: any, config?: Config): Observable<T> {
    if (body && !(body instanceof FormData)) {
      const formData: FormData = new FormData();
      for (let prop in body) {
        if (body.hasOwnProperty(prop)) {
          if(body[prop] instanceof Array){
            for(let sprop of body[prop])
              formData.append(prop, sprop);
          } else{
            formData.append(prop, body[prop]);
          }
        }
      }
      body = formData;
    }
    return this.performRequest(token => this.http.post<T>(makeUrl(url), body, makeConfig(config, token)));
  }

  delete<T>(url, config?: Config): Observable<T> {
    return this.performRequest(token => this.http.delete<T>(makeUrl(url), makeConfig(config, token)));
  }

  put<T>(url, body?: any, config?: Config): Observable<T> {
    const formData: FormData = new FormData();
    for (let prop in body) {
      if (body.hasOwnProperty(prop)) {
        if(body[prop] instanceof Array){
          for(let sprop of body[prop])
            formData.append(prop, sprop);
        } else{
          formData.append(prop, body[prop]);
        }
      }
    }
    return this.performRequest(token => this.http.put<T>(makeUrl(url), body, makeConfig(config, token)));
  }

}
