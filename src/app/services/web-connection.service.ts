import {Injectable} from '@angular/core';
import {ConnectionService} from 'ngx-connection-service';
import {PollingService} from './polling-service';

import {merge, Observable} from 'rxjs';
import {map, skip} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebConnectionService {

  isWebConnection: Observable<boolean> = this.connectionService.monitor().pipe(map(c => c.hasNetworkConnection));
  isSocketConnection: Observable<boolean> = this.pollingService.isConnected$;

  constructor(private connectionService: ConnectionService, private pollingService: PollingService) { }

  checkConnection(): Observable<boolean> {
    return merge(this.isWebConnection, this.isSocketConnection).pipe(skip(1));
  }
}
