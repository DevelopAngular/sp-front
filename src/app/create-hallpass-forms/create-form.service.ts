import { Injectable } from '@angular/core';
import { Pinnable } from '../models/Pinnable';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class CreateFormService {

  isSeen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) { }

  getPinnable() {
    return this.apiService.getPinnables()
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
