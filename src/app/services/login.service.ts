import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { APP_BASE_HREF } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

declare const window;

const STORAGE_KEY = 'google_auth';

export interface DemoLogin {
	username: string;
	password?: string;
	invalid?: boolean;
	kioskMode: boolean;
	type: 'demo-login';
}

export interface ClassLinkLogin {
	classlink_code: string;
	type: 'classlink-login';
}

export interface CleverLogin {
	clever_code: string;
	type: 'clever-login';
}

export interface GoogleLogin {
	google_code: string;
	type: 'google-login';
}

export interface SessionLogin {
	provider: string;
	token?: string;
	username?: string;
}

export function isDemoLogin(d: any): d is DemoLogin {
	return (<DemoLogin>d).type === 'demo-login';
}

export function isClassLinkLogin(d: any): d is ClassLinkLogin {
	return (<ClassLinkLogin>d).type === 'classlink-login';
}

export function isCleverLogin(d: any): d is CleverLogin {
	return (<CleverLogin>d).type === 'clever-login';
}

export function isGoogleLogin(d: any): d is GoogleLogin {
	return (<GoogleLogin>d).type === 'google-login';
}

export type AuthObject = GoogleLogin | DemoLogin | ClassLinkLogin | CleverLogin;

enum OAuthType {
	google = 'google',
}

@Injectable({
	providedIn: 'root',
})
export class LoginService implements OnDestroy {
	static googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=560691963710-220tggv4d3jo9rpc3l70opj1510keb59.apps.googleusercontent.com&response_type=code&access_type=offline&scope=profile%20email%20openid`;

	private authObject$ = new BehaviorSubject<AuthObject>(null);

	public showLoginError$ = new BehaviorSubject(false);
	public loginErrorMessage$: Subject<string> = new Subject<string>();
	public isAuthenticated$ = new ReplaySubject<boolean>(1);
	// public isAuthenticated$ = new BehaviorSubject<boolean>(false);

	destroy$: Subject<any> = new Subject<any>();

	constructor(
		@Inject(APP_BASE_HREF)
		private baseHref: string,
		private storage: StorageService,
		private cookie: CookieService
	) {
		if (baseHref === '/app') {
			this.baseHref = '/app/';
		}

		this.authObject$.pipe(takeUntil(this.destroy$)).subscribe((auth) => {
			if (auth) {
				const storageKey = isDemoLogin(auth)
					? JSON.stringify({ username: (auth as DemoLogin).username, type: (auth as DemoLogin).type })
					: JSON.stringify(auth);
				this.storage.setItem(STORAGE_KEY, storageKey);
			}
		});

		const savedServerConfig = this.storage.getItem('server');
		this.isAuthenticated$.next(!!savedServerConfig && !!this.cookie.get('smartpassToken'));
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	// Returns authObject
	getAuthObject(): Observable<AuthObject> {
		return this.authObject$.pipe(filter((t) => !!t));
	}

	// updating this triggers a login flow, clearing this logs the user out
	public updateAuth(auth: AuthObject) {
		this.authObject$.next(auth);
	}

	clearInternal(permanent: boolean = false) {
		this.authObject$.next(null);
		if (window.location.host.includes('localhost')) {
			this.cookie.delete('smartpassToken', '/', 'localhost', false);
		} else {
			this.cookie.delete('smartpassToken', '/', '.smartpass.app', true);
		}
		this.storage.removeItem('server');
		this.storage.removeItem('current-kiosk-room');

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

	public triggerGoogleAuthFlow(userEmail?: string) {
		// TODO IMPLEMENT THIS
		let url = LoginService.googleOAuthUrl + `&redirect_uri=${this.getRedirectUrl()}google_oauth`;
		if (userEmail) {
			url = url + `&login_hint=${userEmail}`;
		}
		window.location.href = url;
	}

	getRedirectUrl(): string {
		const url = [window.location.protocol, '//', window.location.host, this.baseHref].join('');
		return url;
	}

	signInDemoMode(username: string, password: string) {
		this.authObject$.next({ username: username, password: password, type: 'demo-login', kioskMode: false });
	}

	logout() {
		// IMPLEMENT LOGOUT, not sure if this is needed.
	}
}
