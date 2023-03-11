import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceDetection } from '../device-detection.helper';
import { LoginService } from '../services/login.service';
import { UserService } from '../services/user.service';
import { DomSanitizer, Meta, SafeUrl, Title } from '@angular/platform-browser';
import { filter, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { NotificationService } from '../services/notification-service';
import { LoginDataService } from '../services/login-data.service';
import { StorageService } from '../services/storage.service';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../models/User';
import { environment } from '../../environments/environment';

declare const window;

@Component({
	selector: 'sp-login-page',
	templateUrl: './login-page.component.html',
	styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
	@ViewChild('place') place: ElementRef;

	@Output() errorEvent: EventEmitter<any> = new EventEmitter();

	public appLink: string;
	public titleText: string;
	public trustedBackgroundUrl: SafeUrl;
	public pending$: Observable<boolean>;
	public formPosition: string = '70px';

	private pendingSubject = new ReplaySubject<boolean>(1);
	private isIOSMobile: boolean = DeviceDetection.isIOSMobile();
	private isAndroid: boolean = DeviceDetection.isAndroid();
	private jwt: JwtHelperService;
	private destroyer$ = new Subject<any>();

	constructor(
		private userService: UserService,
		private loginService: LoginService,
		private router: Router,
		private route: ActivatedRoute,
		private sanitizer: DomSanitizer,
		private titleService: Title,
		private metaService: Meta,
		private notifService: NotificationService,
		private loginDataService: LoginDataService,
    private storage: StorageService,
    private cookie: CookieService
	) {
		this.jwt = new JwtHelperService();
		this.pending$ = this.pendingSubject.asObservable();
	}

	get isMobileDevice() {
		return this.isAndroid || this.isIOSMobile;
	}

	ngOnInit() {
		window.Intercom('update', { hide_default_launcher: true });
		this.titleService.setTitle('SmartPass Sign-in');
		this.metaService.addTag({
			name: 'description',
			content:
				"Digital hall pass system and school safety solution. Sign-in with your school account. Don't have an account? Schedule a free demo to see how SmartPass can make your school safer and control the flow of students.",
		});

		setTimeout(() => {
			window.appLoaded();
		}, 700);

    combineLatest([
      this.checkIfAuthOnLoad(),
      this.loginService.isAuthenticated$.asObservable()
    ]).pipe(
      filter((([authOnLoad, authStateChanged]) => authOnLoad || authStateChanged)),
      tap(() => {
        this.userService.getUserRequest();
      }),
      mergeMap(() => this.userService.user$.pipe(filter(Boolean))),
      tap(console.log),
      // mergeMap(() => this.userService.userData.asObservable()
      //   .pipe(catchError(error => { console.warn(error); return throwError(error); }),takeUntil(this.destroyer$), filter<User>(Boolean))),
      tap((user) => {
        user = User.fromJSON(user);
        console.log(user);
        if (NotificationService.hasPermission && environment.production) {
          this.notifService.initNotifications(true);
        }

        const callbackUrl: string = window.history.state.callbackUrl;
        if (callbackUrl != null || callbackUrl !== undefined) {
          this.router.navigate([callbackUrl]);
        } else if (this.isMobileDevice && user.isAdmin() && user.isTeacher()) {
          this.router.navigate(['main']);
        } else if (user.isParent()) {
          this.router.navigate(['parent']);
        } else {
          const loadView = user.isAdmin() ? 'admin' : 'main';
          this.router.navigate([loadView]);
        }
        this.titleService.setTitle('SmartPass');
      })
    ).subscribe();

		this.trustedBackgroundUrl = this.sanitizer.bypassSecurityTrustStyle("url('./assets/Login Background.svg')");

		if (this.isIOSMobile) {
			this.appLink = 'https://itunes.apple.com/us/app/smartpass-mobile/id1387337686?mt=8';
			this.titleText = 'Download SmartPass on the App Store to start making passes.';
		} else if (this.isAndroid) {
			this.appLink = 'https://play.google.com/store/apps/details?id=app.smartpass.smartpass';
			this.titleText = 'Download SmartPass on the Google Play Store to start making passes.';
		}

		this.route.queryParams
			.pipe(
				filter((queryParams) => {
					return queryParams.email || queryParams.school_id || queryParams.instant_login;
				}),
				takeUntil(this.destroyer$)
			)
			.subscribe((qp) => {
				this.loginDataService.setLoginDataQueryParams({ email: qp.email, school_id: qp.school_id, instant_login: qp.instant_login });
			});
	}

  private checkIfAuthOnLoad(): Observable<boolean> {
  //   // Ideally, I don't really want this logic here.
  //   // Application-wide routing due to auth state is better placed in services, guards
  //   // and (to a lesser extent) interceptors.
  //   // However, the services are pretty tangled now, so this will have to do
  //   // TODO: Move this logic into login service after http service and login service are
  //   //  properly split
  //   this.loginService.isAuthenticated$
  //     .pipe(
  //       filter((v) => v),
  //       switchMap((v): Observable<[User, Array<string>]> => {
  //         return zip(
  //           this.userService.userData.asObservable().pipe(filter((user) => !!user)),
  //           INITIAL_LOCATION_PATHNAME.asObservable().pipe(map((p) => p.split('/').filter((v) => v && v !== 'app')))
  //         );
  //       }),
  //       takeUntil(this.destroyer$)
  //     )
  //     .subscribe(([currentUser, path]) => {
  //       if (NotificationService.hasPermission && environment.production) {
  //         this.notifService.initNotifications(true);
  //       }
  //
  //       debugger;
  //
  //       const callbackUrl: string = window.history.state.callbackUrl;
  //       if (callbackUrl != null || callbackUrl !== undefined) {
  //         this.router.navigate([callbackUrl]);
  //       } else if (this.isMobileDevice && currentUser.isAdmin() && currentUser.isTeacher()) {
  //         this.router.navigate(['main']);
  //       } else if (currentUser.isParent()) {
  //         this.router.navigate(['parent']);
  //       } else {
  //         const loadView = currentUser.isAdmin() ? 'admin' : 'main';
  //         this.router.navigate([loadView]);
  //       }
  //       this.titleService.setTitle('SmartPass');
  //     });

  const isCookiePresent = !!this.cookie.get('smartpassToken');

  if (!isCookiePresent) {
    return of(false);
  }

  const svrString = this.storage.getItem('server');
  if (!svrString) {
    return of(false);
  }

  return of(true);

  // return this.userService.userData.asObservable().pipe(
  //   takeUntil(this.destroyer$),
  //   filter<User>(Boolean),
  //   map((user) => {
  //     if (NotificationService.hasPermission && environment.production) {
  //       this.notifService.initNotifications(true);
  //     }
  //
  //     debugger;
  //
  //     const callbackUrl: string = window.history.state.callbackUrl;
  //     if (callbackUrl != null || callbackUrl !== undefined) {
  //       this.router.navigate([callbackUrl]);
  //     } else if (this.isMobileDevice && user.isAdmin() && user.isTeacher()) {
  //       this.router.navigate(['main']);
  //     } else if (user.isParent()) {
  //       this.router.navigate(['parent']);
  //     } else {
  //       const loadView = user.isAdmin() ? 'admin' : 'main';
  //       this.router.navigate([loadView]);
  //     }
  //     this.titleService.setTitle('SmartPass');
  //   }))
  }

	ngOnDestroy() {
		window.Intercom('update', { hide_default_launcher: false });
		this.destroyer$.next(null);
		this.destroyer$.complete();
	}

	formMobileUpdatePosition() {
		if (this.isMobileDevice) {
			this.formPosition = '-25px';
		}
	}

	/*Scroll hack for ios safari*/

	preventTouch($event) {
		$event.preventDefault();
	}
}
