import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval, merge, Observable, of, Subject, timer} from 'rxjs';
import {delay, filter, takeUntil, tap} from 'rxjs/operators';
import {ToastService} from '../services/toast.service';
import {Toast} from '../models/Toast';
import {toastSlideInOut} from '../animations';

const TOASTDELAY = (6 * 1000) - 200;

@Component({
  selector: 'app-custom-toast',
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss'],
  animations: [toastSlideInOut]
})
export class CustomToastComponent implements OnInit, OnDestroy {

  toggleToast: boolean;
  data$: Observable<Toast>;
  cancelable: boolean = true;
  data: Toast;
  timerValue: number;

  destroy$: Subject<any> = new Subject<any>();
  destroyClose$: Subject<any> = new Subject<any>();

  constructor(private toastService: ToastService) { }

  ngOnInit() {
    this.data$ = this.toastService.data$;
    setTimeout(() => { this.toggleToast = true; }, 250);

    this.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.data = data;
    });

    merge(of(1), interval(1000)).pipe(takeUntil(this.destroyClose$))
      .subscribe(seconds => this.timerValue = seconds > 1 ? seconds + 1 : 1);

    timer(TOASTDELAY)
      .pipe(
        filter(() => !this.data.showButton),
        tap(() => this.toggleToast = false),
        delay(200),
        takeUntil(this.destroyClose$)
      ).subscribe(() => {
        this.toastService.closeToast();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(evt?: Event) {
    if (evt) {
      this.toggleToast = false;
      evt.stopPropagation();
      setTimeout(() => {
        this.toastService.closeToast();
      }, 200);
      return;
    }
  }

  download(action) {
    this.toastService.toastButtonClick$.next(action);
  }

  lineColor(type) {
    if (type === 'success') {
      return '#00B476';
    } else if (type === 'error') {
      return '#E32C66';
    } else if (type === 'info') {
      return '#1F195E';
    }
  }

  over() {
    this.destroyClose$.next();
  }

  leave() {
    if (!this.data.showButton) {
      of(null).pipe(
        delay(TOASTDELAY - (this.timerValue * 1000)),
        tap(() => this.toggleToast = false),
        delay(200),
      ).subscribe(() => {
        this.toggleToast = false;
        this.toastService.closeToast();
      });
    }
  }
}
