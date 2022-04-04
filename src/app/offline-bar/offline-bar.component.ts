import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {PollingService} from '../services/polling-service';

@Component({
  selector: 'app-offline-bar',
  templateUrl: './offline-bar.component.html',
  styleUrls: ['./offline-bar.component.scss']
})
export class OfflineBarComponent implements OnInit {

  isDisplaying: boolean = false;
  isActionClose: boolean = true;
  autoCloseTimeout: any = null;

  statusIcon$: BehaviorSubject<string>;
  statusText$: BehaviorSubject<string>;
  actionIcon$: BehaviorSubject<string>;

  constructor(
    private pollingService: PollingService
  ) {}

  ngOnInit() {
    this.statusIcon$ = new BehaviorSubject('./assets/Connected (Jade).svg');
    this.statusText$ = new BehaviorSubject('Your internet connection was restored.');
    this.actionIcon$ = new BehaviorSubject('./assets/Cancel (Blue-Gray).svg');

    let isFirstStatus = true;
    this.pollingService.isConnected$.subscribe(isConnected => {
      if (isConnected) {
        this.statusIcon$.next('./assets/Connected (Jade).svg');
        this.statusText$.next('Your internet connection was restored.');
        this.actionIcon$.next('./assets/Cancel (Blue-Gray).svg');
        this.clearTimeout();
        this.autoCloseTimeout = setTimeout(() => {
          this.isDisplaying = false;
        }, 10000);
        this.isActionClose = true;
      } else {
        if (isFirstStatus) this.pollingService.refreshHeartbeatTimer();
        this.statusIcon$.next('./assets/Disconnected (Blue-Gray).svg');
        this.statusText$.next('You are currently offline.');
        this.actionIcon$.next('./assets/Refresh (Jade).svg');
        this.isDisplaying = true;
        this.isActionClose = false;
      }
      isFirstStatus = false;
    });
  }

  action(): void {
    if (this.isActionClose) {
      this.isDisplaying = false;
      this.clearTimeout();
    } else {
      this.pollingService.refreshHeartbeatTimer();
    }
  }

  clearTimeout() {
    if (this.autoCloseTimeout != null) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = null;
    }
  }
}
