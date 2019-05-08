import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import { NgProgress } from '@ngx-progressbar/core';
import {catchError, finalize, tap} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable()
export class ProgressInterceptor implements HttpInterceptor {

  constructor(
    private progress: NgProgress,
    private router: Router
  ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.progress.ref().start();
        return next.handle(req)
                    .pipe(
                      finalize(() => this.progress.ref().complete()),
                      catchError((error: any) => {
                        // console.log(error);
                          if (error.status >= 400 && error.status < 600 && error.url !== 'https://smartpass.app/api/discovery/find') {
                            this.router.navigate(['error']);
                            // console.log(error.status >= 400 && error.status < 600);
                          }
                        return throwError(error);
                      })
                    );
    }
}
