import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Router} from '@angular/router';
import {HttpService} from './services/http-service';

@Injectable()
export class ProgressInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private http: HttpService
  ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const nextReq = req.clone({
        headers: req.headers.set('Cache-Control', 'public, max-age=86400')
      });
        return next.handle(nextReq)
                    .pipe(
                      catchError((error: any) => {
                                  // debugger;
                        const exeptedUrls = [
                          'onboard/schools/check_school',
                          'discovery/find',
                          'discovery/email_info',
                          'auth/by-token',
                          'o/token',
                          'pass_requests/'
                        ].every(_url => error.url.search(_url) < 0);

                        if ( error.status === 0 || (error.status >= 400 && error.status !== 403 && error.status < 600 && exeptedUrls) ) {
                          // console.log(error);
                          this.http.errorToast$.next({
                            header: 'Something went wrong.',
                            message: `Please try refreshing the page. If the issue keeps occurring, contact us below. Error status code:${error.status}`
                          });
                        }
                        return throwError(error);
                      })
                    );
    }
}
