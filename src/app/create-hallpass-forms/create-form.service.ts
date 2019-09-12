import { Injectable } from '@angular/core';
import { Pinnable } from '../models/Pinnable';
import {BehaviorSubject, ReplaySubject} from 'rxjs';
import { HallPassesService } from '../services/hall-passes.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CreateFormService {

  private transition: any;
  private frameMotionDirection$: BehaviorSubject<any>;

  public scalableBoxController = new ReplaySubject<boolean>(1);
  public isSeen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private hallPassService: HallPassesService) {
    this.transition = {
      to: -100,
      halfTo: -50,
      from: 100,
      halfFrom: 50,
      direction: 'forward'
    };
    this.frameMotionDirection$ = new BehaviorSubject(this.transition);
  }

  getPinnable(filter?: boolean) {
    return this.hallPassService.pinnables$
      .pipe(
        map((pins) => {
          if (filter) {
            return pins.filter((p: Pinnable) => (p.type === 'location' && !p.location.restricted) || p.type === 'category');
          } else {
            return pins;
          }
        })
      );
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
      case 'disable':
        this.transition.to = -100;
        this.transition.halfTo = -50;
        this.transition.from = 0;
        this.transition.halfFrom = 0;
        this.frameMotionDirection$.next(this.transition);
        break;

      case 'forward':
        this.transition.direction = 'forward';
        this.transition.to = -100;
        this.transition.halfTo = -50;
        this.transition.from = 100;
        this.transition.halfFrom = 50;
        this.frameMotionDirection$.next(this.transition);
        break;

      case 'back':
        this.transition.direction = 'back';
        this.transition.to = 100;
        this.transition.halfTo = 50;
        this.transition.from = -100;
        this.transition.halfFrom = -50;
        this.frameMotionDirection$.next(this.transition);
        break;

    }
  }
  getFrameMotionDirection() {
    return  this.frameMotionDirection$;
  }
}
