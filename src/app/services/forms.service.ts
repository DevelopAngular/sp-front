import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FormsService {

  constructor(private http: HttpClient) {
  }

  getUrl(address): string {
    return `https://smartpass.app/api/staging/${address}`;
  }

  saveQuoteRequest(name, position, email, phone, schools) {
    return this.http.post(this.getUrl('v1/acquisition/quoteRequest'), {
      'name': name,
      'position': position,
      'email': email,
      'phone': phone,
      'schools': schools,
    });
  }

  saveHdyhau(recordId, hdyhau) {
    return this.http.post(this.getUrl('v1/acquisition/updateHdyhau'), {
      'recordId': recordId,
      'selected': hdyhau
    });
  }

  getPredemoComplete(calendlyId) {
    return this.http.post(this.getUrl('v1/acquisition/predemoGetComplete'), {'calendlyId': calendlyId});
  }

  savePredemoForm(calendlyId, data) {
    console.log({
      'calendlyId': calendlyId,
      ...data
    })
    return this.http.post(this.getUrl('v1/acquisition/predemo'), {
      'calendlyId': calendlyId,
      ...data
    });
  }
}
