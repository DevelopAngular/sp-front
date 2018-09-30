import { Injectable } from '@angular/core';
import { $WebSocket } from 'angular2-websocket/angular2-websocket';
import { Observable } from 'rxjs/index';
import { filter, map, publish, refCount, switchMap, tap } from 'rxjs/operators';
import { AuthContext, HttpService } from './http-service';
import { Logger } from './logger.service';

interface RawMessage {
  type: string;
  data: any;
}

export interface PollingEvent {
  action: string;
  data: any;
}

function doesFilterMatch(prefix: string, path: string): boolean {
  const prefixParts = prefix.split('.');
  const pathParts = path.split('.');

  if (prefixParts.length > pathParts.length) {
    return false;
  }

  for (let i = 0; i < prefixParts.length; i++) {
    if (prefixParts[i] !== pathParts[i]) {
      return false;
    }
  }

  return true;
}

@Injectable({
  providedIn: 'root'
})
export class PollingService {

  private readonly eventStream: Observable<PollingEvent>;

  constructor(private http: HttpService, private _logger: Logger) {

    this.eventStream = this.getEventListener().pipe(publish(), refCount());
  }

  private getRawListener(): Observable<RawMessage> {
    return this.http.accessToken.pipe(
      switchMap((ctx: AuthContext) => {
        const url = ctx.server.ws_url;

        const ws = new $WebSocket(url);

        ws.send4Direct(JSON.stringify({'action': 'authenticate', 'token': ctx.auth.access_token}));

        return Observable.create(s => {

          ws.onMessage(event => s.next({
            type: 'message',
            data: JSON.parse(event.data),
          }));

          ws.onError(event => {
            s.next({
              type: 'error',
              data: event,
            });
          });

          ws.onClose(() => s.complete());

          return () => {
            ws.close();
          };
        });
      })
    );
  }

  private getEventListener(): Observable<PollingEvent> {
    return this.getRawListener().pipe(
      tap(event => {
        if (event.type !== 'message') {
          this._logger.error(event);
        }
      }),
      filter(event => event.type === 'message'),
      map(event => event.data),
    );
  }

  listen(filterString?: string): Observable<PollingEvent> {
    if (filterString) {
      return this.eventStream.pipe(filter(e => doesFilterMatch(filterString, e.action)));
    } else {
      return this.eventStream;
    }
  }

}
