import { Injectable } from '@angular/core';
import { HttpService } from './http-service';

@Injectable({
  providedIn: 'root'
})
export class IDCardService {

  constructor(
    private http: HttpService,
  ) { }

  enableIDCard() {
   return this.http.patch('v1/id_card/enable');
  }

  disableIDCard() {
    return this.http.patch('v1/id_card/disable');
   }

  getIDCardDetails(){
    return this.http.get('v1/id_card');
  }
}
