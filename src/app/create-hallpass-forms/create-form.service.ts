import { Injectable } from '@angular/core';
import { Pinnable } from '../models/Pinnable';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../services/api.service';
import {transition} from '@angular/animations';

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
      // textColor: '#1F195E',
      // background: '#FFFFFF'
    };
    this.frameMotionDirection$ = new BehaviorSubject(this.transition);
  }

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

  setFrameMotionDirection(direction: string = 'forward', coloredWith?: string /* It should be radial gradient*/) {


    switch (direction) {
      case ('disable'): {

        this.transition.to = -100;
        this.transition.halfTo = -50;
        this.transition.from = 0;
        this.transition.halfFrom = 0;

        this.frameMotionDirection$.next(this.transition);
        break;
      }
      // case ('setColoredTransition'): {
      //   this.transition.textColor = '#FFFFFF'
      //   this.transition.background = coloredWith || '#FFFFFF';
      //
      //   this.frameMotionDirection$.next(this.transition);
      //   // this.frameMotionDirection$.next({ to: -100, halfTo: -50, from: 100, halfFrom: 50});
      //   break;
      // }
      // case ('unsetColoredTransition'): {
      //   this.transition.textColor = ' #1F195E'
      //   this.transition.background = '#FFFFFF';
      //
      //   this.frameMotionDirection$.next(this.transition);
      //   // this.frameMotionDirection$.next({ to: -100, halfTo: -50, from: 100, halfFrom: 50});
      //   break;
      // }
      case ('forward'): {

        this.transition.to = -100;
        this.transition.halfTo = -50;
        this.transition.from = 100;
        this.transition.halfFrom = 50;

        this.frameMotionDirection$.next(this.transition);

        // this.frameMotionDirection$.next({ to: -100, halfTo: -50, from: 100, halfFrom: 50});
        break;
      }
      case ('back'): {

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
