import { Injectable } from '@angular/core';
import { HttpService } from './http-service';

import * as oboe from 'oboe';

@Injectable({
  providedIn: 'root'
})
export class PollingService {

  constructor(private http: HttpService) {
  }

  doStuff() {
    this.http.accessToken.subscribe(token => {

      console.log(new Date());

      const r = oboe({
        method: 'GET',
        url: 'https://notify-messenger-notify-server-staging.lavanote.com/api/v1/long_polling',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      r.node('!.*', obj => {

        // This callback will be called everytime a new object is
        // found in the foods array.

        console.log(new Date());
        console.log('Go eat some', obj);
      });

    });


  }


}
