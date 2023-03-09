import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoginService } from './services/login.service';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  excludedCredUrls = [
    'email_info',
    'sessions',
    'discovery'
  ]

  constructor(private loginService: LoginService) {}

  private addCredentials(request: HttpRequest<any>): HttpRequest<any> {
    return request.clone({
      withCredentials: true
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
    const newRequest = this.urlMatchesExceptions(request.url)
      ? request
      : this.addCredentials(request);

    return next.handle(newRequest).pipe(
      catchError(error => {
        if ((error instanceof HttpErrorResponse) && error.status === 401) {
          this.loginService.isAuthenticated$.next(false);
          return throwError(error);
        }
      })
    )
  }
}
