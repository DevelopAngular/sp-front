import { Injectable } from '@angular/core';
import { HttpService } from './http-service';

@Injectable({
  providedIn: 'root'
})
export class IDCardService {

  constructor(
    private http: HttpService,
  ) { }

  addIDCard(body){
    return this.http.post('v1/id_card', body);
  }

  enableIDCard() {
   return this.http.patch('v1/id_card/enable');
  }

  disableIDCard() {
    return this.http.patch('v1/id_card/disable');
   }

  getIDCardDetails(){
    return this.http.get('v1/id_card');
  }

  getIDCardDetailsEdit(){
    return this.http.get('v1/id_card/edit');
  }

  updateIDCardField(body){
    return this.http.patch('v1/id_card', body);
  }

}
