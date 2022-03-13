import {Component, OnInit} from '@angular/core';
import {Observable, BehaviorSubject, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {PollingService} from '../services/polling-service';

@Component({
  selector: 'app-offline-bar',
  templateUrl: './offline-bar.component.html',
  styleUrls: ['./offline-bar.component.scss']
})
export class OfflineBarComponent implements OnInit {

  isDisplaying: boolean = false
  autoCloseTimeout: any = null;

  isConnected$: Observable<boolean>;
  statusIcon$: BehaviorSubject<string>;
  statusText$: BehaviorSubject<string>;

  constructor(
    private pollingService: PollingService
  ) {}

  ngOnInit() {
    this.statusIcon$ = new BehaviorSubject('./assets/Connected (Jade).svg');
    this.statusText$ = new BehaviorSubject('Your internet connection was restored.');

    this.isConnected$ = combineLatest(
      this.pollingService.isOnline$, this.pollingService.isConnected$
    ).pipe(map(data => {
      let online, isConnected;
      [online, isConnected] = data;
      return online && isConnected;
    }));
    this.isConnected$.subscribe(isConnected => {
      if (isConnected) {
        this.statusIcon$.next('./assets/Connected (Jade).svg');
        this.statusText$.next('Your internet connection was restored.');
        this.clearTimeout();
        this.autoCloseTimeout = setTimeout(() => {
          this.isDisplaying = false;
        }, 10000);
      } else {
        this.statusIcon$.next('./assets/Disconnected (Blue-Gray).svg');
        this.statusText$.next('You are currently offline.');
        this.isDisplaying = true;
      }
    });
  }

  refresh(): void {
    this.pollingService.reconnectWebsocket();
  }

  close(): void {
    this.isDisplaying = false;
    this.clearTimeout();
  }

  clearTimeout() {
    if (this.autoCloseTimeout != null) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = null;
    }
  }
}
