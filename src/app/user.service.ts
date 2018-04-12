import {Injectable} from '@angular/core';
import {GoogleAuthService} from 'ng-gapi';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {HttpService} from './http-service';
import {environment} from '../environments/environment';
import {DataService} from './data-service';
import {Observable} from 'rxjs/Observable';
import {Router} from '@angular/router';
import {User} from './models';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishReplay';
import GoogleUser = gapi.auth2.GoogleUser;
import GoogleAuth = gapi.auth2.GoogleAuth;
import { JSONSerializer } from './models';

interface ServerAuth {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires: Date;
  scope: string;
}

function ensureFields<T, K extends keyof T>(obj: T, keys: K[]) {
  for (const key of keys) {
    if (!obj.hasOwnProperty(key)) {
      throw new Error(`${key} not in ${obj}`);
    }
  }
}

function truthy(obj: any): boolean {
  return !!obj;
}

@Injectable()
export class UserService {

  public static SESSION_STORAGE_KEY = 'accessToken';
  private user: GoogleUser;

  private googleTokenSubject: BehaviorSubject<string>;
  private googleAuthTool: BehaviorSubject<GoogleAuth>;

  public googleToken: Observable<string>;
  public serverAuth: Observable<ServerAuth>;
  public userData: Observable<User>;

  constructor(private googleAuth: GoogleAuthService, private http: HttpService, private dataService: DataService, private router: Router, private serializer:JSONSerializer) {
    this.googleTokenSubject = new BehaviorSubject<string>(localStorage.getItem(UserService.SESSION_STORAGE_KEY));
    this.googleToken = this.googleTokenSubject
      .filter(truthy)
      .do(token => console.log('[UserService]', 'New Google Token:', token))
      .publishReplay(1).refCount();

    this.serverAuth = this.googleToken
      .mergeMap(token => this.fetchServerAuth(token))
      .do(auth => console.log('[UserService]', 'New Server Auth:', auth))
      .publishReplay(1).refCount();

    this.userData = this.serverAuth
      .mergeMap(auth => this.fetchUser(auth))
      .do(user => console.log('[UserService]', 'New User Data:', user))
      .publishReplay(1).refCount();

    // load Google auth and save to subject so users can wait if necessary for it
    // A BehaviorSubject is used here so that the stored value can be retrieved directly.
    this.googleAuthTool = new BehaviorSubject(null);
    this.googleAuth.getAuth().subscribe(auth => this.googleAuthTool.next(auth));

    // wire this service to update DataService when no values are retrieved.


    const sessionTimeout = 0;
    let tokenTimout = 0;

    this.serverAuth.subscribe(auth => {
      this.dataService.updateBarer(auth.access_token);
      tokenTimout = auth.expires_in * 1000 * .25;
      setTimeout(() => {
        console.log('Re-verifying access token.');
        this.fetchServerAuth(auth.access_token);
      }, tokenTimout);
    });

    this.userData.subscribe(user => this.dataService.updateUser(user));
  }

  public signIn() {
    const auth = this.googleAuthTool.value;

    if (!auth) {
      console.error('Auth not loaded!');
      return;
    }

    return Promise.all([
      auth.signIn().then(user => {
        this.user = user;
        this.setToken(user.getAuthResponse().id_token);
        this.dataService.updateGUser(user);
        return user as GoogleUser;
      }),
      new Promise((resolve, reject) => this.userData.subscribe(resolve, reject)),
    ]);
  }

  public setToken(token: string) {
    localStorage.setItem(UserService.SESSION_STORAGE_KEY, token);
    this.googleTokenSubject.next(token);
  }

  public isAuthLoaded(): Observable<boolean> {
    return this.googleAuthTool.map(tool => tool !== null);
  }

  private fetchServerAuth(googleToken: string): Observable<ServerAuth> {
    const config = new FormData();

    config.set('client_id', environment.serverConfig.client_id);
    config.set('provider', 'google-auth-token');
    config.set('token', googleToken);

    return this.http.post('auth/by-token', config)
      .map((data: any) => {
        data['expires'] = new Date(new Date() + data['expires_in']);

        ensureFields(data, ['access_token', 'token_type', 'expires', 'scope']);

        return data as ServerAuth;
      });
  }

  private fetchUser(auth: ServerAuth): Observable<User> {
    const newConfig = {headers: {'Authorization': 'Bearer ' + auth.access_token}};
    let user:Observable<User>;
    user = this.http.get<User>('api/methacton/v1/users/@me', newConfig);
    return user;
  }
}
