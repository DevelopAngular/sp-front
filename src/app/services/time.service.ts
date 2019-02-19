import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, interval, Observable } from 'rxjs';
import { distinctUntilChanged, map, publishReplay, refCount, repeat, scan } from 'rxjs/operators';
import { PollingEvent, PollingService } from './polling-service';

interface RTTimeReport {
  requestTime: number;
  responseTime: number;
  serverTime: number;
}

interface DriftEstimate {
  drift: number; // server - client
  error: number;
}

function computeEstimatedDrift(report: RTTimeReport): DriftEstimate {
  // written defensively against integer overflow and cast to an integer

  let error = report.responseTime - report.requestTime;
  if (error === 0) {
    error = 1;
  }

  return {
    drift: Math.round(report.serverTime - report.responseTime / 2 - report.requestTime / 2),
    error: error,
  };
}

function combineDriftEstimates(estimates: DriftEstimate[]) {
  let numerator = 0;
  let denominator = 0;

  for (const estimate of estimates) {
    numerator += estimate.drift / estimate.error;
    denominator += 1 / estimate.error;
  }

  return Math.round(numerator / denominator);
}

@Injectable({
  providedIn: 'root'
})
/**
 * This service has static methods for convenience. It must be dependency injected somewhere
 * to properly load it's drift measurements.
 */
export class TimeService {
  // An estimate the client's time drift from server time. This number is calculated as server time - client time
  // so that it can be added to the client's current time.
  private static latestDriftEstimate$ = new BehaviorSubject(0);

  private heartbeat$: Observable<PollingEvent>;
  private timeResponse$: Observable<PollingEvent>;


  now$ = interval(500)
    .map(() => this.nowDate())
    .pipe(
      publishReplay(1),
      refCount(),
    );

  static getNowDate(): Date {
    return new Date(Date.now() + TimeService.latestDriftEstimate$.value);
  }

  constructor(private pollingService: PollingService) {

    this.heartbeat$ = this.pollingService.listen('heartbeat');
    this.timeResponse$ = this.pollingService.listen('time.time_response');

    this.heartbeat$.take(1).subscribe(() => {
      this.requestServerTime()
        .pipe(
          repeat(10),
          map(computeEstimatedDrift),
          scan<DriftEstimate>((acc, value) => {
            const acc2 = [value, ...acc];
            // only keep the eight lowest error drift estimates.
            acc2.sort((a, b) => a.error - b.error);
            return acc2.slice(0, 7);
          }, []),
          map(combineDriftEstimates),
          distinctUntilChanged()
        )
        .subscribe(driftEstimate => TimeService.latestDriftEstimate$.next(driftEstimate));
    });

    TimeService.latestDriftEstimate$.subscribe(drift => {
      console.log(`This computer has an estimated drift of ${-drift}ms from server time`);
    });

  }

  /**
   * This method has some important caveats. First, it cannot handle simultaneous calls sharing the same websocket.
   * Second, it's a cold observable ie. it only sends the request to the server when someone subscribes to it.
   */
  private requestServerTime(): Observable<RTTimeReport> {
    return defer(() => {
      const requestTime = Date.now();
      this.pollingService.sendMessage('time.time_request', null);

      return this.timeResponse$
        .map(event => {
          return {
            requestTime: requestTime,
            serverTime: Date.parse(event.data.utc_time),
            responseTime: Date.now()
          };
        })
        .take(1);
    });
  }

  now() {
    return Date.now() + TimeService.latestDriftEstimate$.value;
  }

  nowDate(): Date {
    return new Date(this.now());
  }


}
