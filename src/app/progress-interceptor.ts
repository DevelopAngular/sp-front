import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Router} from '@angular/router';
import {HttpService} from './services/http-service';
import {ToastService} from './services/toast.service';

@Injectable()
export class ProgressInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private inj: Injector,
    private toast: ToastService
  ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const http = this.inj.get(HttpService);
        return next.handle(req)
                    .pipe(
                      catchError((error: any) => {
                        const exeptedUrls = [
                          'onboard/schools/check_school',
                          'discovery/find',
                          'discovery/email_info',
                          'auth/by-token',
                          'o/token',
                          'pass_requests/',
                          'hall_passes/bulk_create',
                          'hall_passes',
                          'forms/quoterequest',
                          '//server.test-cors.org'
                        ].every(_url => error.url.search(_url) < 0);

                        if ( (error.status >= 400 && error.status !== 403 && error.status < 600 && exeptedUrls) ) {
                          this.toast.openToast({title: 'Oh no! Something went wrong', subtitle: `Please try refreshing the page. If the issue keeps occuring, contact us at support@smartpss.app. (${error.status})`, type: 'error'});
                          // http.errorToast$.next({
                          //   header: 'Something went wrong.',
                          //   message: `Please try refreshing the page. If the issue keeps occurring, contact us below. Error status code:${error.status}`
                          // });
                        }
                        return throwError(error);
                      })
                    );
    }
}
