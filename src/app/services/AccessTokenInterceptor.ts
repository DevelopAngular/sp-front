import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {HttpService} from './http-service';
import {catchError, filter, switchMap, take} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class AccessTokenInterceptor implements HttpInterceptor {
    constructor(private inj: Injector) {
    }

    //const noAuthPoints

    // Tracks whether we are currently refreshing
    private refreshingTokenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const http = this.inj.get(HttpService);
        const ctx = http.getAuthContext();

        if (!ctx) {
            // If no ctx, do nothing
            return next.handle(req);
        }

        // Only pass access token when needed
        if (req.url.includes(ctx.server.api_root)) {
            req = this.addAccessToken(http, req);
        }

        return next.handle(req).pipe(catchError(err => {
            // Don't attempt to retry non SmartPass requests
            if (!req.url.includes(ctx.server.api_root)) {
                throw err;
            }

            if (err.status !== 401) {
                throw err;
            }

            if (this.refreshingTokenSubject.value) {
                return this.refreshingTokenSubject.pipe(
                    filter(r => r === false), // Wait until we are done refreshing
                    take(1),
                    switchMap(() => next.handle(this.addAccessToken(http, req)))
                );
            } else {
                this.refreshingTokenSubject.next(true);
                console.log('Going to refresh access token');
                return http.refreshAuthContext().pipe(
                    switchMap(() => {
                        console.log('Refreshed access token successfully');
                        this.refreshingTokenSubject.next(false);
                        return next.handle(this.addAccessToken(http, req));
                    }),
                    catchError(err2 => {
                      console.log('Refresh error: ', err2);
                      throw err2;
                    })
                );
            }
        }));
    }

    addAccessToken(http: HttpService, req: HttpRequest<any>): HttpRequest<any> {
        const ctx = http.getAuthContext();
        const token = ctx.auth.access_token;
        return req.clone({
            setHeaders: {
                Authorization: 'Bearer ' + token
            }
        });
    }

}
