import {Injectable} from '@angular/core';
import {$WebSocket} from 'angular2-websocket/angular2-websocket';
import {BehaviorSubject, NEVER, Observable, Subject, Subscription, fromEvent, merge} from 'rxjs';
import {filter, map, publish, refCount, switchMap, tap} from 'rxjs/operators';
import {HttpService} from './http-service';
import {Logger} from './logger.service';

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
  // console.log(prefixParts);
  // debugger

  return true;
}

@Injectable({
  providedIn: 'root'
})
export class PollingService {

  private eventStream: Subject<PollingEvent> = new Subject();
  private rawMessageStream: Subject<RawMessage> = new Subject();

  private sendMessageQueue$ = new Subject();
  private websocket: $WebSocket = null;

  isConnected$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isOnline$: Observable<boolean>;

  private failedHeartbeats: number = 0;
  private lastHeartbeat: number = Date.now();
  private lastReconnectAttempt: number = Date.now();

  constructor(private http: HttpService,
              private _logger: Logger) {
    this.connectWebsocket();
    this.createEventListener();
    this.listenForHeartbeat();
    this.createOnlineListener();
    setTimeout(() => {
      this.checkForHeartbeat();
    }, this.getHeartbeatTime());
  }

  private connectWebsocket(): void {
    if (this.websocket !== null)
      return;

    this.http.authContext$.subscribe(ctx => {
        if (ctx === null) {
          return NEVER;
        }

        let sendMessageSubscription: Subscription = null;

        const url = ctx.server.ws_url;
        const ws = new $WebSocket(url, null, {
          reconnectIfNotNormalClose: false,
        });
        console.log('Websocket created');
        this.websocket = ws;

        let opened = false;

        ws.onOpen(() => {
          opened = true;

          console.log('Websocket opened');
          ws.send4Direct(JSON.stringify({'action': 'authenticate', 'token': ctx.auth.access_token}));

          // any time the websocket opens, trigger an invalidation event because listeners can't trust their
          // current state but by refreshing and listening from here, they will get all updates. (technically
          // there is a small unsafe window because the invalidation event should be sent when the authentication
          // success event is received)
          this.rawMessageStream.next({
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

        setTimeout(() => {
          if (!opened)
            ws.close(true);
        }, 5000);

        ws.onMessage(event => {
          this.rawMessageStream.next({
            type: 'message',
            data: JSON.parse(event.data),
          });
        });

        ws.onError(event => {
          this.rawMessageStream.next({
            type: 'error',
            data: event,
          });
        });

        /* This observable should never complete, so the following code has been disabled.

        // we can't use .onClose() because onClose is triggered whenever the internal connection closes
        // even if a reconnect will be attempted.
        ws.getDataStream().subscribe(() => null, () => null, () => {
          s.complete();
        });
         */

        ws.onClose(() => {
          if (sendMessageSubscription !== null) {
            sendMessageSubscription.unsubscribe();
            sendMessageSubscription = null;
            // debugger
          }
          this.isConnected$.next(false);
          this.websocket = null;
        });
      });
  }

  private disconnectWebsocket(): void {
    if (this.websocket === null)
      return;

    this.websocket.close(true);
  }

  reconnectWebsocket(): void {
    if (this.lastReconnectAttempt + 10 * 1000 < Date.now())
      return;
    this.lastReconnectAttempt = Date.now();

    this.disconnectWebsocket();
    this.connectWebsocket();
  }

  private createEventListener(): void {
    this.rawMessageStream.pipe(
      tap(event => {
        if (event.type !== 'message') {
          this._logger.error(event);
        }
      }),
      filter(event => event.type === 'message'),
      map(event => event.data),
    ).subscribe(event => {
      this.eventStream.next(event);
    });
  }

  private createOnlineListener(): void {
    this.isOnline$ = merge(
      fromEvent(window, 'online').pipe(map(e => {
        this.connectWebsocket();
        return true;
      })),
      fromEvent(window, 'offline').pipe(map(e => {
        this.isConnected$.next(false);
        this.disconnectWebsocket();
        return false;
      })),
    );
  }

  listen(filterString?: string): Observable<PollingEvent> {
    if (filterString) {
      return this.eventStream.pipe(publish(), refCount(), filter(e => doesFilterMatch(filterString, e.action)));
    } else {
      return this.eventStream.pipe(publish(), refCount());
    }
  }

  sendMessage(action: String, data: any) {
    this.sendMessageQueue$.next({action, data});
  }

  private getHeartbeatTime(): number {
    if (this.failedHeartbeats == 0) {
      return 20 * 1000;
    }
    return Math.min(Math.pow(2, this.failedHeartbeats), 30) * 1000;
  }

  private listenForHeartbeat(): void {
    this.listen('heartbeat')
      .subscribe((data) => {
        this.lastHeartbeat = Date.now();
      });
  }

  private checkForHeartbeat(): void {
    if (this.lastHeartbeat < Date.now() - 20000) {
      this.isConnected$.next(false);
      this.failedHeartbeats += 1;
      if (this.websocket !== null)
        this.reconnectWebsocket();
    } else {
      this.isConnected$.next(true);
      this.failedHeartbeats = 0;
    }

    setTimeout(() => {
      this.checkForHeartbeat();
    }, this.getHeartbeatTime());
  }
}
