import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FormsService {

  constructor(private http: HttpClient) {
  }

  getUrl(address): string {
    return `https://smartpass.app/api/prod-us-central/${address}`;
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
    return this.http.post(this.getUrl('v1/acquisition/predemoGetComplete'), {'meetingID': calendlyId});
  }

  savePredemoForm(calendlyId, data) {
    return this.http.post(this.getUrl('v1/acquisition/predemo'), {
      'meetingId': calendlyId,
      ...data
    });
  }

  querySchools(query) {
    let url = this.getUrl('v1/acquisition/schoolSearch');
    return this.http.get(url + '?query=' + query)
  }


  addSchool(data) {
    return this.http.post(this.getUrl('v1/acquisition/addSchool'), data);
  }
}
