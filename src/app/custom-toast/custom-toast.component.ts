import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subject, timer} from 'rxjs';
import {delay, filter, takeUntil} from 'rxjs/operators';
import {ToastService} from '../services/toast.service';
import {Toast} from '../models/Toast';
import {toastSlideInOut} from '../animations';

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

  destroy$: Subject<any> = new Subject<any>();

  constructor(private toastService: ToastService) { }

  ngOnInit() {
    this.data$ = this.toastService.data$;
    setTimeout(() => { this.toggleToast = true; }, 250);

    this.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.data = data;
    });
    timer(2000).pipe(filter(() => this.cancelable && !this.data.showButton)).subscribe(() => {
        this.close();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(evt?: Event) {
    if (evt) {
      evt.stopPropagation();
    }
    this.toggleToast = false;
    of(null).pipe(
      delay(500)
    ).subscribe(() => {
      this.toastService.closeToast();
    });
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
    this.cancelable = false;
  }

  leave() {
    if (!this.data.showButton) {
      this.cancelable = true;
      this.close();
    }
  }
}
