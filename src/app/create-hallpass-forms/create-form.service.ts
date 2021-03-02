import {Injectable} from '@angular/core';
import {Pinnable} from '../models/Pinnable';
import {BehaviorSubject, of, ReplaySubject, zip} from 'rxjs';
import {HallPassesService} from '../services/hall-passes.service';
import {map, switchMap} from 'rxjs/operators';
import {LocationsService} from '../services/locations.service';
import {ScreenService} from '../services/screen.service';


@Injectable({
  providedIn: 'root'
})
export class CreateFormService {

  private transition: any;
  private frameMotionDirection$: BehaviorSubject<any>;

  public scalableBoxController = new ReplaySubject<boolean>(1);
  public compressableBoxController = new ReplaySubject<boolean>(1);
  public isSeen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private hallPassService: HallPassesService,
    private locService: LocationsService,
    private screenService: ScreenService,

  ) {
    this.transition = {
      to: -100,
      halfTo: -50,
      from: 100,
      halfFrom: 50,
      direction: 'disable',
      frameSpeed: this.screenService.isDeviceLargeExtra ? '.23s' : '.27s',
      subFrameSpeed: this.screenService.isDeviceLargeExtra ? '.10s' : '.15s',
    };
    this.frameMotionDirection$ = new BehaviorSubject(this.transition);
  }

  getPinnable(filter?: boolean) {
    return this.hallPassService.pinnables$
      .pipe(
        map((pins: Pinnable[]) => {
          if (filter) {
            return pins.filter((p: Pinnable) => {
             return (p.type === 'location' && !p.location.restricted) || p.type === 'category';
            });
          } else {
            return pins;
          }
        }),
        switchMap(pinnables => {
          if (filter) {
            return zip(...pinnables.map((pin: any) => {
              if (pin.type === 'category') {
                return this.locService.getLocationsWithCategory(pin.category)
                  .pipe(
                    map(locations => {
                      pin.myLocations = locations;
                      return pin;
                    }));
              } else {
                return of(pin);
              }
            }));
          } else {
            return of(pinnables);
          }
        }),
        map(pins => {
          if (filter) {
            return pins.filter(pin => {
              if (pin.type === 'category') {
                const validLocs = pin.myLocations.filter(loc => !loc.restricted);
                return validLocs.length;
              } else {
                return true;
              }
            });
          } else {
            return pins;
          }
        })
      );
  }

  setFrameMotionDirection(direction: string = 'forward') {


    switch (direction) {
      case 'disable':
        this.transition.to = 0;
        this.transition.halfTo = 0;
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
