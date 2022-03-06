import {Component, OnInit} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs';
import {PollingService} from '../services/polling-service';

@Component({
  selector: 'app-offline-bar',
  templateUrl: './offline-bar.component.html',
  styleUrls: ['./offline-bar.component.scss']
})
export class OfflineBarComponent implements OnInit {

  isDisplaying: boolean = true;

  isConnected$: Observable<boolean>;
  statusIcon$: BehaviorSubject<string>;
  statusText$: BehaviorSubject<string>;

  constructor(
    private pollingService: PollingService
  ) {}

  ngOnInit() {
    this.statusIcon$ = new BehaviorSubject('./assets/Connected (Jade).svg');
    this.statusText$ = new BehaviorSubject('Your internet connection was restored.');

    this.isConnected$ = this.pollingService.isConnected$;
    this.isConnected$.subscribe(isConnected => {
      if (isConnected) {
        this.statusIcon$.next('./assets/Connected (Jade).svg');
        this.statusText$.next('Your internet connection was restored.');
        setTimeout(() => {
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
    this.pollingService.reconnect();
  }

  close(): void {
    this.isDisplaying = false;
  }
}
