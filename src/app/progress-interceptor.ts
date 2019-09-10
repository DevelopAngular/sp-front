import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import { NgProgress } from '@ngx-progressbar/core';
import {catchError, finalize, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {HttpService} from './services/http-service';

@Injectable()
export class ProgressInterceptor implements HttpInterceptor {

  constructor(
    private progress: NgProgress,
    private router: Router,
    private http: HttpService
  ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.progress.ref().start();
        return next.handle(req)
                    .pipe(
                      finalize(() => this.progress.ref().complete()),
                      catchError((error: any) => {

                        const exeptedUrls = [
                          'onboard/schools/check_school',
                          'discovery/find',
                          'auth/by-token',
                          'o/token'
                        ].every(_url => error.url.search(_url) < 0);

                        if ( error.status === 0 || ( error.status >= 400 && error.status < 600 && exeptedUrls) ) {
                          console.log(error);
                          this.http.errorToast$.next({
                            header: 'Server Error.',
                            message: `Please try refreshing the page. If the issue keeps occurring, contact us below. Error status code:${error.status}`
                          });
                        }
                        return throwError(error);
                      })
                    );
    }
}
