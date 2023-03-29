import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { catchError, delay, exhaustMap, filter, map, mapTo, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { BUILD_DATE, RELEASE_NAME } from '../../build-info';
import { environment } from '../../environments/environment';
import { School } from '../models/School';
import { AppState } from '../ngrx/app-state/app-state';
import { clearSchools, getSchools } from '../ngrx/schools/actions';
import { getCurrentSchool, getLoadedSchools, getSchoolsCollection, getSchoolsLength } from '../ngrx/schools/states';
import { AuthObject, isClassLinkLogin, isCleverLogin, isDemoLogin, isGoogleLogin, LoginService, SessionLogin } from './login.service';
import { StorageService } from './storage.service';
import { SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { SignedOutToastComponent } from '../signed-out-toast/signed-out-toast.component';
import { Router } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
// uncomment when app uses formatDate and so on
//import {APP_BASE_HREF, registerLocaleData} from '@angular/common';
import { LoginDataService } from './login-data.service';
import { clearUser } from '../ngrx/user/actions';

declare const window: Window;

export interface Config {
	[key: string]: any;
}

export interface AuthProviderResponse {
	provider: string;
	sourceId: string;
	name: string;
}

export enum AuthType {
	Password = 'password',
	Google = 'google',
	Classlink = 'classlink',
	Clever = 'clever',
	GG4L = 'gg4l',
	Empty = '',
}

export enum LoginProvider {
	Password = 'password',
	Classlink = 'classlink',
	Clever = 'clever',
	Google = 'google-access-token',
}

export interface DiscoverServerResponse {
	auth_types: AuthType[];
	auth_providers: AuthProviderResponse[];
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

	if (/(proxy)/.test(environment.buildType)) {
		const auth = JSON.parse(localStorage.getItem('auth'));
		const token = auth.auth.access_token;
		headers['Authorization'] = 'Bearer ' + token;
	}

	// console.log('[X-School-Id]: ', headers['X-School-Id'])
	// console.log('[Headers]: ', headers)
	// console.log('[Headers]: ', Object.assign({}, config || {}, {
	//   headers: headers,
	//   responseType: 'json',
	// }) as any);
	// console.log("headers : ", headers)

	if (config !== undefined && 'headers' in config) {
		Object.assign(headers, config.headers);
		delete config.headers;
	}

	return Object.assign({}, config || {}, {
		headers: headers,
		responseType: config?.responseType == 'blob' ? ('blob' as 'json') : 'json',
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
		} else if (/(local)/.test(environment.buildType)) {
			url = environment.preferEnvironment.api_root + endpoint;
		} else {
			// url = 'https://smartpass.app/api/prod-us-central' + endpoint;
			// url = 'https://smartpass.app/api/staging/' + endpoint;

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
		auth_token: string;
		refresh_token?: string;
		access_token?: string;
	};
}

export interface LoginChoice {
	server: LoginServer;
	classlink_token?: string;
	clever_token?: string;
	google_token?: string;
	token?: any;
}

export interface AuthContext {
	server: LoginServer;
	auth: ServerAuth;
	classlink_token?: string;
	clever_token?: string;
	google_token?: string;
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

class SilentError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SPSilentError';
	}
}

const discoveryEndpoint = (userName: string) =>
	/proxy/.test(environment.buildType)
		? `/api/discovery/email_info?email=${encodeURIComponent(userName)}`
		: `https://smartpass.app/api/discovery/email_info?email=${encodeURIComponent(userName)}`;

const discoveryV2Endpoint = /(proxy)/.test(environment.buildType) ? '/api/discovery/v2/find' : 'https://smartpass.app/api/discovery/v2/find';

/**
 * This service is supposed to build off Angular's HttpClient but it ends up
 * also tracking the authentication state, authcontext and dealing with a bunch
 * of other login behaviour
 *
 * This has to be refactored very heavily to remove the login behavior and to track
 * the auth state elsewhere
 */
@Injectable({
	providedIn: 'root',
})
export class HttpService implements OnDestroy {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	public schoolSignInRegisterText$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

	private _authContext: AuthContext = null;
	public authContext$: BehaviorSubject<AuthContext> = new BehaviorSubject<AuthContext>(null);

	public effectiveUserId: BehaviorSubject<number> = new BehaviorSubject(null);
	public schoolToggle$: Subject<School> = new Subject<School>();
	public schools$: Observable<School[]> = this.loginService.isAuthenticated$.pipe(
		filter((v) => v),
		exhaustMap((v) => {
			return this.getSchoolsRequest();
		}),
		exhaustMap(() =>
			this.schoolsCollection$.pipe(
				filter((s) => !!s.length),
				take(1)
			)
		)
	);
	public langToggle$: Subject<string> = new Subject<string>();
	public schoolsCollection$: Observable<School[]> = this.store.select(getSchoolsCollection);
	public schoolsLoaded$: Observable<boolean> = this.store.select(getLoadedSchools);
	public currentUpdateSchool$: Observable<School> = this.store.select(getCurrentSchool);
	public schoolsLength$: Observable<number> = this.store.select(getSchoolsLength);

	public currentSchoolSubject = new BehaviorSubject<School>(null);
	public currentSchool$: Observable<School> = this.currentSchoolSubject.asObservable();

	public currentLangSubject = new BehaviorSubject<string>('en');
	public currentLang$: Observable<string> = this.currentLangSubject.asObservable();
	// should come from server
	public langs$: Observable<string[]> = of(['en', 'es']);

	public globalReload$ = this.currentSchool$.pipe(
		filter((school) => !!school),
		map((school) => (school ? school.id : null)),
		delay(5)
	);

	private hasRequestedToken = false;

	private cannotRefreshGoogle = new Error('cannot refresh google');
	private cannotRefreshClassLink = new Error('cannot refresh classlink');
	private cannotRefreshClever = new Error('cannot refresh clever');

	constructor(
		@Inject(APP_BASE_HREF)
		private baseHref: string,
		private http: HttpClient,
		private loginService: LoginService,
		private storage: StorageService,
		private pwaStorage: LocalStorage,
		private store: Store<AppState>,
		private matDialog: MatDialog,
		private router: Router,
		private loginDataService: LoginDataService
	) {
		if (baseHref === '/app') {
			this.baseHref = '/app/';
		}

		// the school list is loaded when a user authenticates and we need to choose a current school of the school array.
		// First, if there is a current school loaded, try to use that one.
		// Then, if there is a school id saved in local storage, try to use that.
		// Last, choose a school arbitrarily.
		combineLatest(this.schools$, this.loginDataService.loginDataQueryParams.pipe(filter((res) => !!res)))
			.pipe(
				takeUntil(this.destroyed$),
				filter((schools) => !!schools.length)
			)
			.subscribe(([schools, queryParams]) => {
				if (queryParams && queryParams.school_id) {
					const selectedSchool = schools.find((school) => +school.id === +queryParams.school_id);
					if (selectedSchool) {
						this.currentSchoolSubject.next(selectedSchool);
						this.storage.setItem('last_school_id', selectedSchool.id);
						return;
					} else {
						this.setSchool(null);
						this.clearInternal();
						this.loginService.clearInternal();
						this.store.dispatch(clearUser());
						this.store.dispatch(clearSchools());
						return;
					}
				}
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
					// sort schools alphabetically
					const sortedSchools = schools.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
					this.currentSchoolSubject.next(sortedSchools[0]);
					return;
				}
				this.currentSchoolSubject.next(null);
				return;
			});

		this.langs$
			.pipe(
				takeUntil(this.destroyed$),
				filter((lang) => !!lang)
			)
			.subscribe((langs) => {
				const lang = this.storage.getItem('codelang');
				if (!!lang) {
					if (langs.includes(lang)) {
						this.currentLangSubject.next(lang);
						return;
					} else {
						this.setLang(null);
						return;
					}
				}
				const chosenLang = this.currentLangSubject.getValue();
				if (chosenLang !== null && langs.includes(chosenLang)) {
					this.currentLangSubject.next(chosenLang);
					return;
				}

				if (langs.length > 0) {
					this.currentLangSubject.next(langs[0]);
					return;
				}
				this.currentLangSubject.next(null);
				return;
			});

		this.setLang('en');
		// HACK!
		this.storage.setItem('ljs-lang', 'en');

		// When HTTPService is being constructed, if the user is already signed in, then authObject will resolve immediately.
		// This creates a circular dependency for HTTPService in AccessTokenInterceptor.
		// We break the cycle, by setting a timeout on the binding here.
		setTimeout(() => {
			this.loginService
				.getAuthObject()
				.pipe(
					takeUntil(this.destroyed$),
					switchMap((authObj) => {
						return this.fetchServerAuth(authObj);
					})
				)
				.subscribe({
					next: (authCtx) => {
						this.setAuthContext(authCtx);
						this.loginService.isAuthenticated$.next(true);
					},
				});
		});

		this.authContext$.pipe(takeUntil(this.destroyed$)).subscribe({
			next: (ctx) => {
				if (ctx === null) {
					console.log('Auth CTX set to null');
				} else {
					console.log('Auth CTX updated');
				}
			},
		});
	}

	ngOnDestroy() {
		console.log('HttpService ngOnDestroy: cleaning up...');
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}

	/**
	 * Discover which server the user is on
	 * @param userName the username or email of the account
	 */
	discoverServer(userName: string) {
		return this.http.get<DiscoverServerResponse>(discoveryEndpoint(userName)).pipe(
			tap((response) => {
				if (response?.auth_types?.length === 0) {
					throw new Error("Couldn't find that username or email");
				}
			})
		);
	}

	getServerFromStorage(): { server: LoginServer } {
		let server = this.storage.getItem('server');
		if (!server) {
			this.loginService.isAuthenticated$.next(false);
			return null;
		}

		return JSON.parse(server);
	}

	// Used in AccessTokenInterceptor for token refresh and adding access token
	getAuthContext(): AuthContext {
		return this._authContext;
	}

	setAuthContext(ctx: any, forKioskMode: boolean = false): void {
		if (ctx && (!this.storage.getItem('server') || forKioskMode)) {
			this.storage.setItem('server', JSON.stringify(ctx));
		}
		this._authContext = ctx;
		this.authContext$.next(ctx);
	}

	// THIS SHOULD BE IN THE LOGIN SERVICE
	// The code is so tangled right now that doing a major refactor may be too time-consuming
	updateAuthFromExternalLogin(url: string, loginCode: string, scope: string) {
		if (url.includes('google_oauth')) {
			this.storage.setItem('authType', AuthType.Google);
			this.loginService.updateAuth({ google_code: loginCode, type: 'google-login' });
		} else if (url.includes('classlink_oauth')) {
			this.storage.setItem('authType', AuthType.Classlink);
			this.loginService.updateAuth({ classlink_code: loginCode, type: 'classlink-login' });
		} else if (!!scope) {
			this.storage.setItem('authType', AuthType.Clever);
			this.loginService.updateAuth({ clever_code: loginCode, type: 'clever-login' });
		}
	}

	getRedirectUrl(): string {
		const url = [window.location.protocol, '//', window.location.host, this.baseHref].join('');
		return url;
	}

	getEncodedRedirectUrl(): string {
		const redirect = encodeURIComponent(this.getRedirectUrl());
		return redirect;
	}

	loginSession(authObject: AuthObject) {
		const formData = new FormData();
		let sessionLogin: Partial<SessionLogin> = {};

		formData.append('platform_type', 'web');
		if (isDemoLogin(authObject)) {
			sessionLogin.provider = LoginProvider.Password;
			sessionLogin.token = authObject.password;
			sessionLogin.username = authObject.username;
			formData.append('email', authObject.username);
		} else if (isClassLinkLogin(authObject)) {
			sessionLogin.provider = LoginProvider.Classlink;
			formData.append('code', authObject.classlink_code);
			formData.append('provider', 'classlink');
		} else if (isCleverLogin(authObject)) {
			sessionLogin.provider = LoginProvider.Clever;
			formData.append('code', authObject.clever_code);
			formData.append('provider', 'clever');
			formData.append('redirect_uri', this.getRedirectUrl());
		} else if (isGoogleLogin(authObject)) {
			sessionLogin.provider = LoginProvider.Google;
			formData.append('code', authObject.google_code);
			formData.append('provider', 'google-oauth-code');
			formData.append('redirect_uri', this.getRedirectUrl() + 'google_oauth');
		}

		return this.http.post(discoveryV2Endpoint, formData).pipe(
			switchMap((servers: LoginResponse) => {
				return this.pwaStorage.setItem('servers', servers).pipe(mapTo(servers));
			}),
			switchMap((servers: LoginResponse) => {
				if (!isDemoLogin(authObject)) {
					sessionLogin.token = servers.token.access_token;
				}
				return this.http
					.post<never>(makeUrl(servers.servers[0], 'sessions'), sessionLogin, {
						withCredentials: true,
						observe: 'response',
					})
					.pipe(
						map((response) => {
							console.log(response.headers);
							return { server: servers.servers[0] };
						})
					);
			})
		);
	}

	private fetchServerAuth(authObject: any): Observable<{ server: LoginServer }> {
		return this.loginSession(authObject).pipe(
			catchError((err) => {
				console.log('Failed to fetch serverAuth, err: ', err);
				// Attempt to refresh once...
				// return this.doRefresh().pipe(
				// 	catchError((err2) => {
				// 		return of(err2);
				// 	})
				// );
				return throwError(err);
			})
		);
	}

	private performRequest<T>(predicate: (ctx: LoginServer) => Observable<T>): Observable<T> {
		let server = this.storage.getItem('server');
		if (!server) {
			this.loginService.isAuthenticated$.next(false);
			return throwError(new LoginServerError('No login server!'));
		}

		const parsedServer: { server: LoginServer } = JSON.parse(server);

		return predicate(parsedServer.server);
	}

	// Used in AccessTokenInterceptor to trigger refresh
	refreshAuthContext(): Observable<any> {
		const signOutCatch = catchError((err) => {
			this.showSignBackIn().subscribe((_) => {
				if (err === this.cannotRefreshGoogle) {
					const url = LoginService.googleOAuthUrl + `&redirect_uri=${this.getRedirectUrl()}google_oauth`;
					this.loginService.clearInternal(true);
					window.location.href = url;
				} else if (err === this.cannotRefreshClever) {
					this.loginService.clearInternal(true);
					const redirect = this.getEncodedRedirectUrl();
					window.location.href = `https://clever.com/oauth/authorize?response_type=code&redirect_uri=${redirect}&client_id=f4260ade643c042482a3`;
				} else {
					this.router.navigate(['sign-out']);
				}
			});
			this.loginService.isAuthenticated$.next(false);
			throw err;
		});

		return of(1);
	}

	// private doSPTokenRefresh(kioskMode: boolean): Observable<AuthContext> {
	// 	// We have to get the context from storage here because this.getAuthContext will be null during first load.
	// 	const auth: AuthContext = JSON.parse(this.storage.getItem('auth'));
	// 	const s = auth ? auth : null;
	// 	const refresh_token = auth ? auth.auth.refresh_token : null;
	//
	// 	if (!s || !refresh_token) {
	// 		return throwError(new LoginServerError('Please sign in again.'));
	// 	}
	//
	// 	const c: AuthContext = s;
	// 	const server = c.server;
	// 	const config = new FormData();
	// 	config.append('client_id', server.client_id);
	// 	config.append('grant_type', 'refresh_token');
	// 	config.append('token', refresh_token);
	//
	// 	if (kioskMode) {
	// 		const token = this.storage.getItem('kioskToken');
	// 		const jwt = new JwtHelperService();
	// 		const locId = jwt.decodeToken(token).kiosk_location_id;
	// 		config.append('kiosk_mode_location_id', locId);
	// 	}
	//
	// 	return this.http.post(makeUrl(server, 'o/token/'), config).pipe(
	// 		tap({ next: (o) => console.log('Received refresh object: ', o) }),
	// 		map((data: Object) => {
	// 			data['expires'] = moment().add(data['expires_in'], 'seconds').toDate();
	// 			const ctx: AuthContext = { auth: data as ServerAuth, server: server } as AuthContext;
	// 			return ctx;
	// 		}),
	// 		tap({
	// 			next: (ctx: AuthContext) => {
	// 				// this.storage.setItem('refresh_token', ctx.auth.refresh_token);
	// 				if (kioskMode) {
	// 					this.storage.setItem('kioskToken', ctx.auth.access_token);
	// 					this.kioskTokenSubject$.next(ctx.auth);
	// 				}
	// 				this.storage.setItem('auth', JSON.stringify(ctx));
	// 			},
	// 		})
	// 	);
	// }

	// This will throw errors if encountered
	// private doRefresh(): Observable<AuthContext> {
	// 	const isKiosk = this.storage.getItem('kioskToken') != null;
	// 	if (isKiosk) {
	// 		return this.doSPTokenRefresh(true);
	// 	}
	//
	// 	const authType = this.storage.getItem('authType');
	//
	// 	if (!authType) {
	// 		return throwError(new LoginServerError('Please sign in again.'));
	// 	}
	//
	// 	switch (authType) {
	// 		case 'password':
	// 			return this.doSPTokenRefresh(false);
	// 		case 'google':
	// 			const url = LoginService.googleOAuthUrl + `&redirect_uri=${this.getRedirectUrl()}google_oauth`;
	// 			this.showSignBackIn()
	// 				.pipe(takeUntil(this.destroyed$))
	// 				.subscribe((_) => {
	// 					this.loginService.clearInternal(true);
	// 					window.location.href = url;
	// 				});
	// 			return throwError(this.cannotRefreshGoogle);
	// 		case 'clever':
	// 			return throwError(this.cannotRefreshClever);
	// 		default:
	// 			return throwError(new Error('Unknown authType'));
	// 	}
	// }

	showSignBackIn(): Observable<any> {
		const ref = this.matDialog.open(SignedOutToastComponent, {
			panelClass: 'form-dialog-container-white',
			disableClose: true,
			backdropClass: 'white-backdrop',
			data: {},
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
			// this.storage.removeItem('last_school_id');
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

	// uncomment when app uses formatDate
	//private esUSRegistered = false;

	setLang(lang: string) {
		if (!!lang) {
			this.storage.setItem('codelang', lang);
		} else {
			this.storage.removeItem('codelang');
		}
		this.currentLangSubject.next(lang);
		// uncomment when app uses formatDate and so on
		//if (lang === 'es' && !this.esUSRegistered) {
		//  import(
		/* webpackInclude: /es-US\.js$/ */
		//    '@angular/common/locales/es-US'
		//  ).then(lang => {
		//    registerLocaleData(lang.default);
		//    this.esUSRegistered = true;
		//  });
		//}
	}

	getLang() {
		return this.currentLangSubject.getValue();
	}

	// bridge between lang code as it is used in app and ISO locale_id
	// uncomment when app uses formatDate and so on
	/*private localeIDMap = {'en': 'en-US', 'es': 'es-US'};
  get LocaleID() {
    const code = this.getLang();
    return this.localeIDMap[code] ?? 'en-US';
  }*/

	getEffectiveUserId() {
		return this.effectiveUserId.getValue();
	}

	searchIcons(search: string, config?: Config) {
		return this.performRequest((ctx) => {
			return this.http.get(`${ctx.icon_search_url}?query=${search}`);
		});
	}

	get<T>(url, config?: Config, schoolOverride?: School): Observable<T> {
		const school = schoolOverride !== undefined ? schoolOverride : this.getSchool();
		const effectiveUserId = this.getEffectiveUserId();
		return this.performRequest<T>((server) => this.http.get<T>(makeUrl(server, url), makeConfig(config, school, effectiveUserId)));
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

		return this.performRequest((server) =>
			this.http.post<T>(makeUrl(server, url), body, makeConfig(config, this.getSchool(), this.getEffectiveUserId()))
		);
	}

	delete<T>(url, config?: Config): Observable<T> {
		return this.performRequest((server) =>
			this.http.delete<T>(makeUrl(server, url), makeConfig(config, this.getSchool(), this.getEffectiveUserId()))
		);
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
		return this.performRequest((server) =>
			this.http.put<T>(makeUrl(server, url), body, makeConfig(config, this.getSchool(), this.getEffectiveUserId()))
		);
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
		return this.performRequest((server) =>
			this.http.patch<T>(makeUrl(server, url), body, makeConfig(config, this.getSchool(), this.getEffectiveUserId()))
		);
	}
}
