import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {Report, ReportDataUpdate} from '../models/Report';

@Injectable({
  providedIn: 'root'
})
export class ReportUpdateService {

  private updateReportEvent$: Subject<ReportDataUpdate> = new Subject();
  private updateReport$: Observable<Report>;

  emit(updata: ReportDataUpdate) {
    this.updateReportEvent$.next(updata);
  }

  notifier() {
    return this.updateReportEvent$.asObservable();
  }
}
