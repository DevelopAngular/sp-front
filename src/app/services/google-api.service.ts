import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';

export const SP_GAPI_CONFIG = new InjectionToken('sp-gapi.config');

interface GapiClientConfig {
  /**
   * The app's client ID, found and created in the Google Developers Console.
   */
  client_id?: string;

  /**
   * The domains for which to create sign-in cookies. Either a URI, single_host_origin, or none.
   * Defaults to single_host_origin if unspecified.
   */
  cookie_policy?: string;

  /**
   * The scopes to request, as a space-delimited string. Optional if fetch_basic_profile is not set to false.
   */
  scope?: string;

  /**
   * Fetch users' basic profile information when they sign in. Adds 'profile' and 'email' to the requested scopes. True if unspecified.
   */
  fetch_basic_profile?: boolean;

  /**
   * The Google Apps domain to which users must belong to sign in. This is susceptible to modification by clients,
   * so be sure to verify the hosted domain property of the returned user. Use GoogleUser.getHostedDomain() on the client,
   * and the hd claim in the ID Token on the server to verify the domain is what you expected.
   */
  hosted_domain?: string;

  /**
   * Used only for OpenID 2.0 client migration. Set to the value of the realm that you are currently using for OpenID 2.0,
   * as described in <a href="https://developers.google.com/accounts/docs/OpenID#openid-connect">OpenID 2.0 (Migration)</a>.
   */
  openid_realm?: string;

  /**
   * The UX mode to use for the sign-in flow.
   * By default, it will open the consent flow in a popup.
   */
  ux_mode?: 'popup' | 'redirect';

  /**
   * If using ux_mode='redirect', this parameter allows you to override the default redirect_uri that will be used at the end of the consent flow.
   * The default redirect_uri is the current URL stripped of query parameters and hash fragment.
   */
  redirect_uri?: string;

  discoveryDocs: string[];
}

export class GoogleApiConfig {
  constructor(private clientConfig: GapiClientConfig) {
  }

  getClientConfig() {
    return this.clientConfig;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {
  gapiUrl = 'https://apis.google.com/js/api.js';
  config: GoogleApiConfig;

  onLoad$: Subject<any> = null;

  constructor(@Inject(SP_GAPI_CONFIG) config: GapiClientConfig) {
    this.config = new GoogleApiConfig(config);
    this.loadGapi().subscribe();
  }

  onLoad(): Observable<any> {
    if (this.onLoad$) {
      return this.onLoad$.pipe(take(1));
    }

    this.onLoad$ = new ReplaySubject(1);

    const node = document.createElement('script');
    node.src = this.gapiUrl;
    node.type = 'text/javascript';
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);
    node.onload = () => {
      this.onLoad$.next(true);
    };

    return this.onLoad$.pipe(take(1));
  }

  getConfig() {
    return this.config;
  }

  loadGapi() {
    return this.onLoad();
  }
}
