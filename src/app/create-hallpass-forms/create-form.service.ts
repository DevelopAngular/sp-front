import { Injectable } from '@angular/core';
import { Pinnable } from '../models/Pinnable';
import { HttpService } from '../services/http-service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateFormService {

  isSeen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpService) { }

  getPinnable() {
    return this.http.get<any[]>('v1/pinnables/arranged')
        .toPromise()
        .then(json => json.map(raw => Pinnable.fromJSON(raw)));
  }

  seen() {
    if (localStorage.getItem('first-modal') === 'seen') {
      this.isSeen$.next(true);
    } else {
      localStorage.setItem('first-modal', 'seen');
    }
  }
}
