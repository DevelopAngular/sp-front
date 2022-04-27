import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {take, catchError} from 'rxjs/operators';
import {HttpService} from '../../services/http-service';
import {Status} from '../../models/Report';

@Injectable()
export class StatusNotifyerService {
  private notifyer$: Subject<Status>;
  private status$: Observable<Status>;

  constructor(private http: HttpService) {
    this.notifyer$ = new Subject();
    this.status$ = this.notifyer$ as Observable<Status>;
    this.http = http;
  }

  setStatus(value: Status, remoteid?: number) {
    const updateFields = {
      status: value,
      id: remoteid ?? null,
    }
    if (!! remoteid) {
      this.http.patch(`v1/event_reports`, updateFields).pipe(
        take(1), 
        catchError(err => err)
      ).subscribe(() => this.notifyer$.next(value));
    } else {
      this.notifyer$.next(value)
    }
  }

  getStatus(): Observable<Status> {
    return this.status$;
  }
}
