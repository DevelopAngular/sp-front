import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { LoginErrors, LoginService } from './services/login.service';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { StorageService } from './services/storage.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	excludedCredUrls = ['email_info', 'discovery', 'storage.googleapis.com'];

	constructor(
		private storageService: StorageService,
		private cookieService: CookieService,
		private loginService: LoginService,
		private router: Router
	) {}

	private addCredentials(request: HttpRequest<any>): HttpRequest<any> {
		return request.clone({
			withCredentials: true,
		});
	}

	private urlMatchesExceptions(url: string) {
		for (const exception of this.excludedCredUrls) {
			if (url.includes(exception)) {
				return true;
			}
		}

		return false;
	}

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		const newRequest = this.urlMatchesExceptions(request.url) ? request : this.addCredentials(request);

		return next.handle(newRequest).pipe(
			catchError((error) => {
				if (error instanceof HttpErrorResponse && error.status === 401) {
					if (newRequest.url.includes('sessions')) {
						this.loginService.loginErrorMessage$.next(error.error.detail);
					}

					this.cookieService.delete('smartpassToken');
					this.storageService.removeItem('server');
					this.loginService.isAuthenticated$.next(false);
					this.router.navigate(['']);
					return of(null);
				}

				return throwError(error);
			})
		);
	}
}
