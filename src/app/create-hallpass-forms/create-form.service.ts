import { Injectable } from '@angular/core';
import { Pinnable } from '../models/Pinnable';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class CreateFormService {

  isSeen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private frameMotionDirection$: BehaviorSubject<any> = new BehaviorSubject({ to: -100, from: 100});

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

  setFrameMotionDirection(direction: string = 'forward') {

    switch (direction) {
      case ('disable'): {
        this.frameMotionDirection$.next({ to: -100, halfTo: -50, from: 0, halfFrom: 0});
        break;
      }
      case ('forward'): {
        this.frameMotionDirection$.next({ to: -100, halfTo: -50, from: 100, halfFrom: 50});
        break;
      }
      case ('back'): {
        this.frameMotionDirection$.next({ to: 100, halfTo: 50, from: -100, halfFrom: -50});
        break;
      }
    }
  }
  getFrameMotionDirection() {
    return  this.frameMotionDirection$;
  }
}
