import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DeviceDetection } from '../device-detection.helper';
import { DomSanitizer, Meta, SafeUrl, Title } from '@angular/platform-browser';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, ReplaySubject, Subject } from 'rxjs';

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

	constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private titleService: Title, private metaService: Meta) {
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

		this.trustedBackgroundUrl = this.sanitizer.bypassSecurityTrustStyle("url('./assets/Login Background.svg')");

		if (this.isIOSMobile) {
			this.appLink = 'https://itunes.apple.com/us/app/smartpass-mobile/id1387337686?mt=8';
			this.titleText = 'Download SmartPass on the App Store to start making passes.';
		} else if (this.isAndroid) {
			this.appLink = 'https://play.google.com/store/apps/details?id=app.smartpass.smartpass';
			this.titleText = 'Download SmartPass on the Google Play Store to start making passes.';
		}
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
