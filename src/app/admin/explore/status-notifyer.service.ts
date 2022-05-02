import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {take, tap, catchError} from 'rxjs/operators';
//import {HttpService} from '../../services/http-service';
import {AdminService} from '../../services/admin.service';
import {ReportDataUpdate, Status} from '../../models/Report';

@Injectable()
export class StatusNotifyerService {
  private notifyer$: Subject<Status>;
  private status$: Observable<Status>;

  constructor(private http: AdminService) {
    this.notifyer$ = new Subject();
    this.status$ = this.notifyer$ as Observable<Status>;
    this.http = http;
  }

  setStatus(value: Status, remoteid?: string) {
    if (!! remoteid) {
      const updateFields: ReportDataUpdate = {
        status: value,
        id: remoteid,
      }
      //this.http.patch(`v1/event_reports`, updateFields).pipe(
      this.http.updateReportRequest(updateFields).pipe(
        take(1), 
        tap(v => console.log('tap', v)),
        catchError(err => err)
      ).subscribe(() => this.notifyer$.next(value));
    } else {
      this.notifyer$.next(value);
    }
  }

  getStatus(): Observable<Status> {
    return this.status$;
  }
}
