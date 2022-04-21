import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {ExploreModule} from './explore.module'; 
import {Status} from '../../models/Report';

@Injectable()
export class StatusNotifyerService {
  private notifyer$: Subject<Status>;
  private status$: Observable<Status>;

  constructor() {
    this.notifyer$ = new Subject();
    this.status$ = this.notifyer$ as Observable<Status>;
  }

  setStatus(value: Status) {
    this.notifyer$.next(value);
  }

  getStatus(): Observable<Status> {
    return this.status$;
  }
}
