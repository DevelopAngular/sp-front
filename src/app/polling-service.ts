import { Injectable } from '@angular/core';
import { $WebSocket } from 'angular2-websocket/angular2-websocket';
import { environment } from '../environments/environment';
import { HttpService } from './http-service';

@Injectable({
  providedIn: 'root'
})
export class PollingService {

  constructor(private http: HttpService) {
  }

  doStuff() {
    this.http.accessToken.subscribe(token => {

      console.log(new Date());

      // use wss://
      const url = environment.serverConfig.host_ws + 'api/v1/long_polling';

      const ws = new $WebSocket(url);

      ws.send4Direct(JSON.stringify({'action': 'authenticate', 'token': token}));

      ws.onMessage(console.log);

      ws.onClose(() => console.log('Closed!'));

    });


  }


}
