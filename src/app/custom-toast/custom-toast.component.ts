import {Component, OnInit} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {delay, filter} from 'rxjs/operators';
import {ToastService} from '../services/toast.service';

@Component({
  selector: 'app-custom-toast',
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss']
})
export class CustomToastComponent implements OnInit {

  toggleToast: boolean;
  data$: Observable<any>;
  cancelable: Subject<boolean> = new Subject<boolean>();

  constructor(private toastService: ToastService) { }

  ngOnInit() {
    this.data$ = this.toastService.data$;
    setTimeout(() => { this.toggleToast = true; }, 250);
    this.data$.pipe(
      filter(data => data.noButton),
      delay(2000)
    ).subscribe(() => {
      this.toastService.closeToast();
    });
  }

  close(evt: Event) {
    evt.stopPropagation();
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

  over() {
    this.cancelable.next(false);
  }

  leave() {
    this.cancelable.next(true);
    this.toastService.closeToast();
  }
}
