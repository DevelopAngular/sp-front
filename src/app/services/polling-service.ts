import { Injectable } from '@angular/core';
import { $WebSocket } from 'angular2-websocket/angular2-websocket';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/index';
import { filter, map, publish, refCount, switchMap, tap } from 'rxjs/operators';
import { AuthContext, HttpService } from './http-service';
import { Logger } from './logger.service';
import {headersToString} from 'selenium-webdriver/http';

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

  private sendMessageQueue$ = new Subject();

  isConnected$ = new BehaviorSubject(false);

  constructor(private http: HttpService, private _logger: Logger) {

    this.eventStream = this.getEventListener().pipe(publish(), refCount());
  }

  private getRawListener(): Observable<RawMessage> {
    return this.http.accessToken.pipe(
      switchMap((ctx: AuthContext) => {
        const url = ctx.server.ws_url;

        const ws = new $WebSocket(url, null, {
          maxTimeout: 5000,
          reconnectIfNotNormalClose: true,
        });

        return Observable.create(s => {

          let sendMessageSubscription: Subscription = null;

          ws.onOpen(() => {
            ws.send4Direct(JSON.stringify({'action': 'authenticate', 'token': ctx.auth.access_token}));

            // any time the websocket opens, trigger an invalidation event because listeners can't trust their
            // current state but by refreshing and listening from here, they will get all updates. (technically
            // there is a small unsafe window because the invalidation event should be sent when the authentication
            // success event is received)
            s.next({
              type: 'message',
              data: {
                action: 'invalidate',
                data: null,
              },
            });
            this.isConnected$.next(true);

            if (sendMessageSubscription !== null) {
              sendMessageSubscription.unsubscribe();
              sendMessageSubscription = null;
            }
            sendMessageSubscription = this.sendMessageQueue$.subscribe(message => {
              ws.send4Direct(JSON.stringify(message));
            });
          });

          ws.onMessage(event => {
            s.next({
              type: 'message',
              data: JSON.parse(event.data),
            });
          });

          ws.onError(event => {
            s.next({
              type: 'error',
              data: event,
            });
          });

          // we can't use .onClose() because onClose is triggered whenever the internal connection closes
          // even if a reconnect will be attempted.
          ws.getDataStream().subscribe(() => null, () => null, () => {
            s.complete();
          });

          ws.onClose(() => {
            if (sendMessageSubscription !== null) {
              sendMessageSubscription.unsubscribe();
              sendMessageSubscription = null;
            }
            this.isConnected$.next(false);
          });

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

  sendMessage(action: String, data: any) {
    this.sendMessageQueue$.next({action, data});
  }

}
