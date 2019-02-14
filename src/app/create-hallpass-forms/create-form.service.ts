import { Injectable } from '@angular/core';
import { Pinnable } from '../models/Pinnable';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class CreateFormService {

  isSeen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private transition: any;
  private frameMotionDirection$: BehaviorSubject<any>;

  constructor(private apiService: ApiService) {
    this.transition = {
      to: -100,
      halfTo: -50,
      from: 100,
      halfFrom: 50,
      direction: 'forward'
    };
    this.frameMotionDirection$ = new BehaviorSubject(this.transition);
  }

  getPinnable() {
    return this.apiService.getPinnables()
        .toPromise()
        .then(json => json.map(raw => Pinnable.fromJSON(raw)));
  }

  seen() {
    // if (localStorage.getItem('first-modal') === 'seen') {
    //   this.isSeen$.next(true);
    // } else {
    //   localStorage.setItem('first-modal', 'seen');
    // }
  }

  setFrameMotionDirection(direction: string = 'forward') {


    switch (direction) {
      case ('disable'): {

        this.transition.to = -100;
        this.transition.halfTo = -50;
        this.transition.from = 0;
        this.transition.halfFrom = 0;

        this.frameMotionDirection$.next(this.transition);
        break;
      }

      case ('forward'): {

        this.transition.direction = 'forward';
        this.transition.to = -100;
        this.transition.halfTo = -50;
        this.transition.from = 100;
        this.transition.halfFrom = 50;

        this.frameMotionDirection$.next(this.transition);

        // this.frameMotionDirection$.next({ to: -100, halfTo: -50, from: 100, halfFrom: 50});
        break;
      }
      case ('back'): {
        this.transition.direction = 'back';
        this.transition.to = 100;
        this.transition.halfTo = 50;
        this.transition.from = -100;
        this.transition.halfFrom = -50;

        this.frameMotionDirection$.next(this.transition);

        // this.frameMotionDirection$.next({ to: 100, halfTo: 50, from: -100, halfFrom: -50});
        break;
      }
    }
  }
  getFrameMotionDirection() {
    return  this.frameMotionDirection$;
  }
}
