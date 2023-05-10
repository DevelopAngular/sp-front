import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AuthObject, DemoLogin, LoginErrorMap, LoginService } from '../../services/login.service';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { filter, finalize, map, pluck, switchMap, take, takeUntil } from 'rxjs/operators';
import { AuthType, HttpService } from '../../services/http-service';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { StorageService } from '../../services/storage.service';
import { DeviceDetection } from '../../device-detection.helper';
import { ToastService } from '../../services/toast.service';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../services/user.service';

declare const window;

export enum LoginMethod {
	OAuth = 1,
	LocalStrategy = 2,
}

/**
 * This component is responsible for logging a user into smartpass
 * There are currently 4 methods of authentication:
 * - Email/Password
 * - Google
 * - Clever
 * - Classlink
 *
 * Component Logic:
 * 1. When this component loads, the query params are checked for a redirect. All platforms
 *    except for email/password redirect back to this page with query params. The code from
 *    the redirect means that the login on the external platforms were successful. This code
 *    is similar to the login token returned by the server after a successful email/password login
 * 2. After the login token from step 1 is retrieved, the component sends another request containing
 *    the token to authenticate the user. This returns an access_token which the UI attaches to all
 *    requests to access SmartPass.
 */
@Component({
	selector: 'sp-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
	@Output() focusEvent: EventEmitter<any> = new EventEmitter<any>();
	@Output() blurEvent: EventEmitter<any> = new EventEmitter<any>();

	public showSpinner = false;
	public loggedWith: number;
	public loginData: {
		demoLoginEnabled: boolean;
		demoUsername: string;
		demoPassword: string;
		authType: AuthType;
	} = {
		demoLoginEnabled: false,
		demoUsername: '',
		demoPassword: '',
		authType: AuthType.Empty,
	};
	public isGoogleLogin: boolean;
	public isStandardLogin: boolean;
	public isClever: boolean;
	public isClasslink: boolean;
	public auth_providers: any;

	public inputFocusNumber = 1;
	public forceFocus$ = new Subject();

	public loginForm: FormGroup;
	public error$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	public disabledButton = true;
	public schoolAlreadyText$: Observable<string>;
	public passwordError: boolean;

	private destroy$ = new Subject();

	constructor(
		private httpService: HttpService,
		private loginService: LoginService,
		private titleService: Title,
		private metaService: Meta,
		private router: Router,
		private route: ActivatedRoute,
		private shortcuts: KeyboardShortcutsService,
		private storage: StorageService,
		private cdr: ChangeDetectorRef,
		private toast: ToastService,
		private cookieService: CookieService,
		private userService: UserService
	) {
		this.schoolAlreadyText$ = this.httpService.schoolSignInRegisterText$.asObservable();

		this.loginService.loginErrorMessage$.pipe(takeUntil(this.destroy$)).subscribe((srvErrorMessage) => {
			if (!(srvErrorMessage in LoginErrorMap)) {
				this.error$.next(srvErrorMessage);
			} else {
				this.error$.next(LoginErrorMap[srvErrorMessage]);
			}
			this.passwordError = !!srvErrorMessage;
			this.showSpinner = false;
		});
	}

	get isMobile() {
		return DeviceDetection.isMobile();
	}

	private resetAuthType() {
		this.isClever = false;
		this.isClasslink = false;
		this.isStandardLogin = false;
		this.isGoogleLogin = false;
	}

	private setAuthType(auth_types: AuthType[]) {
		if (auth_types.includes(AuthType.Google)) {
			this.isGoogleLogin = true;
			return;
		}

		if (auth_types.includes(AuthType.Clever)) {
			this.isClever = true;
			return;
		}

		if (auth_types.includes(AuthType.Classlink)) {
			this.isClasslink = true;
			return;
		}

		if (auth_types.includes(AuthType.Password)) {
			this.isStandardLogin = true;
			return;
		}

		this.loginData.demoLoginEnabled = false;
	}

	ngOnInit(): void {
		this.route.queryParams
			.pipe(
				takeUntil(this.destroy$),
				filter((qp) => !!qp?.code || !!qp?.instant_login),
				switchMap((qp) => {
					return combineLatest([this.loginService.checkIfAuthStored(), this.loginService.isAuthenticated$.asObservable()]).pipe(
						take(1),
						map(([authOnLoad, authStateChanged]) => [authOnLoad || authStateChanged, qp])
					);
				}),
				map(([isAuth, qp]: [boolean, Params]) => {
					if (isAuth) {
						// override the current login by removing their creds and continue to authenticate
						this.cookieService.delete('smartpassToken');
						this.storage.removeItem('server');
						this.userService.userData.next(null);
						this.loginService.isAuthenticated$.next(false);
					}
					this.disabledButton = false;
					this.showSpinner = true;
					return qp;
				})
			)
			.subscribe((qp) => {
				// These query parameters are present after logging into the respective platforms
				// and then being redirected here with new params in the URL
				// The redirect back into this component will be a result of the triggerAuthFromEmail function
				const { code, scope, instant_login } = qp; // scope is only available for clever login
				if (!!instant_login) {
					this.storage.setItem('authType', this.loginData.authType);
					this.initGoogleLogin();
					return;
				}
				const { url } = this.router;
				this.storage.removeItem('context');
				this.httpService.updateAuthFromExternalLogin(url, code as string, scope as string);
			});

		this.loginForm = new FormGroup({
			username: new FormControl(),
			password: new FormControl(),
		});

		this.shortcuts.onPressKeyEvent$
			.pipe(
				filter(() => !this.isMobile),
				takeUntil(this.destroy$),
				pluck('key')
			)
			.subscribe((key) => {
				if (key[0] === 'tab') {
					if (this.inputFocusNumber < 2) {
						this.inputFocusNumber += 1;
					} else if (this.inputFocusNumber === 2) {
						this.inputFocusNumber = 1;
					}
					this.forceFocus$.next();
				} else if (key[0] === 'enter') {
					if (!this.disabledButton && !this.loginData.demoLoginEnabled) {
						this.checkEmail();
					} else if (this.loginData.demoLoginEnabled) {
						this.demoLogin();
					}
				}
			});

		this.storage.showError$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
			this.toast.openToast({ title: 'Cookies are blocked', subtitle: 'Please un-block your cookies so you can sign into SmartPass.', type: 'error' });
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	updateDemoUsername(event) {
		this.showSpinner = false;
		this.loginData.demoLoginEnabled = false;
		if (!event) {
			this.loginData.demoLoginEnabled = false;
			this.loginData.demoUsername = '';
			this.isGoogleLogin = false;
			this.disabledButton = true;
			return false;
		}
		this.loginData.demoUsername = event;
		this.disabledButton = false;
		this.error$.next(null);
		this.passwordError = false;
	}

	updateDemoPassword(event) {
		this.error$.next(null);
		this.passwordError = false;
		this.showSpinner = false;
		// this.loginData.demoPassword = event;
	}

	// After verification, checks whether the email belongs to an external
	// platform authenticator or whether the account's email uses a password
	// to log in
	checkEmail() {
		this.showSpinner = true;
		const userName = this.loginData.demoUsername;

		this.httpService
			.discoverServer(userName)
			.pipe(finalize(() => (this.showSpinner = false)))
			.subscribe({
				next: ({ auth_types, auth_providers }) => {
					console.log(auth_types);
					console.log(auth_providers);
					this.loginData.authType = auth_types[auth_types.length - 1];
					this.auth_providers = auth_providers[0];
					this.resetAuthType();
					this.setAuthType(auth_types);
					this.disabledButton = false;
					this.triggerAuthFromEmail();
					this.cdr.detectChanges();
				},
				error: (err: Error) => {
					this.resetAuthType();
					this.error$.next(err.message);
				},
			});
	}

	/**
	 * This function is called after the user's email has been verified and its auth type
	 * has been returned. It is also called when the user redirects back to this component from a successful
	 * Google authentication.
	 *
	 * For a user whose account is accessed by a password, this function simply shows the password field.
	 * For all other external platform auth, this function redirects to those platforms.
	 */
	triggerAuthFromEmail() {
		this.storage.removeItem('authType');
		this.httpService.schoolSignInRegisterText$.next(null);
		if (this.isGoogleLogin) {
			this.storage.setItem('authType', this.loginData.authType);
			this.initGoogleLogin();
			return;
		}

		if (this.isClever) {
			this.showSpinner = true;
			this.storage.setItem('authType', this.loginData.authType);
			const district = this.auth_providers && this.auth_providers.provider === AuthType.Clever ? this.auth_providers.sourceId : null;
			const redirect = this.httpService.getEncodedRedirectUrl();
			if (district) {
				window.location.href = `https://clever.com/oauth/authorize?response_type=code&redirect_uri=${redirect}&client_id=f4260ade643c042482a3&district_id=${district}`;
			} else {
				window.location.href = `https://clever.com/oauth/authorize?response_type=code&redirect_uri=${redirect}&client_id=f4260ade643c042482a3`;
			}
			return;
		}

		if (this.isClasslink) {
			this.showSpinner = true;
			this.storage.setItem('authType', this.loginData.authType);
			const redirect = this.httpService.getEncodedRedirectUrl() + 'classlink_oauth';
			window.location.href = `https://launchpad.classlink.com/oauth2/v2/auth?scope=oneroster,profile,full&client_id=c1655133410502391e3e32b3fb24cefb8535bd9994d4&response_type=code&redirect_uri=${redirect}`;
			return;
		}

		if (this.isStandardLogin) {
			this.storage.setItem('authType', this.loginData.authType);
			this.inputFocusNumber = 2;
			this.forceFocus$.next();
			this.loginData.demoLoginEnabled = true;
			this.isGoogleLogin = false;
			this.isClasslink = false;
			this.isStandardLogin = false;
			this.isClever = false;
			return;
		}

		// no auth type is set
		this.error$.next('Something went horribly wrong');
	}

	demoLogin() {
		this.showSpinner = true;
		this.titleService.setTitle('SmartPass');
		this.metaService.removeTag('name = "description"');
		this.loggedWith = LoginMethod.LocalStrategy;

		const { username, password } = this.loginForm.value;
		const loginDetails: AuthObject = {
			username,
			password,
			kioskMode: false,
			type: 'demo-login',
		} as DemoLogin;

		of(this.loginService.signInDemoMode(loginDetails.username, loginDetails.password)).pipe(
			finalize(() => {
				this.showSpinner = false;
				this.cdr.detectChanges();
			})
		);
	}

	initGoogleLogin() {
		this.loggedWith = LoginMethod.OAuth;
		this.loginService.loginErrorMessage$.next(null);
		this.loginService.triggerGoogleAuthFlow(this.loginData.demoUsername);
		this.cdr.detectChanges();
	}
}
