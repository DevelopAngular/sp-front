import { Injectable } from '@angular/core';
import { Pinnable } from '../models/Pinnable';
import { HttpService } from '../http-service';

@Injectable({
  providedIn: 'root'
})
export class CreateFormService {

  isSeen: boolean;

  constructor(private http: HttpService) { }

  getPinnable() {
    return this.http.get<any[]>('v1/pinnables/arranged')
        .toPromise()
        .then(json => json.map(raw => Pinnable.fromJSON(raw)));
  }
}
