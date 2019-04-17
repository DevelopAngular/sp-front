import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import { NgProgress } from '@ngx-progressbar/core';
import { finalize } from 'rxjs/operators';

@Injectable()
export class ProgressInterceptor implements HttpInterceptor {

  constructor(
    private progress: NgProgress,
  ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.progress.ref().start();
        return next.handle(req).pipe(finalize(() => this.progress.ref().complete()));
    }
}
