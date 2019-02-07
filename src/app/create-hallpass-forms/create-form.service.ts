import { Injectable } from '@angular/core';
import { Pinnable } from '../models/Pinnable';
import { HttpService } from '../http-service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateFormService {

  isSeen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private frameMotionDirection$: BehaviorSubject<any> = new BehaviorSubject({ to: -100, from: 100});

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

  setFrameMotionDirection(direction: string = 'forward') {

    switch (direction) {
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
