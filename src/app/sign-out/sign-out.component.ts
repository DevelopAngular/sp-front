import { AfterContentInit, Component } from '@angular/core';
import { LoginService } from '../services/login.service';
import { HttpService } from '../services/http-service';
import { environment } from '../../environments/environment';
import { UserService } from '../services/user.service';
import { StorageService } from '../services/storage.service';
import _refiner from 'refiner-js';

declare const window;

@Component({
	selector: 'app-sign-out',
	templateUrl: './sign-out.component.html',
	styleUrls: ['./sign-out.component.scss'],
})
export class SignOutComponent implements AfterContentInit {
	constructor(private http: HttpService, private loginService: LoginService, private userService: UserService, private storage: StorageService) {
		if (this.storage.getItem('authType') === 'gg4l') {
			this.storage.setItem('gg4l_invalidate', true);
		}
		this.http.setSchool(null);
		this.userService.clearUser();
		_refiner('resetUser');
		window.posthog.reset();
	}

	ngAfterContentInit() {
		setTimeout(() => {
			this.http.clearInternal();
			this.loginService.clearInternal(true);
			window.location.href = '/';
		}, 500);
	}
}
