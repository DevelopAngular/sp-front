import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';
import {ToastService} from '../services/toast.service';

@Component({
  selector: 'app-custom-toast',
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss']
})
export class CustomToastComponent implements OnInit {

  toggleToast: boolean;
  data$: Observable<any>;

  constructor(private toastService: ToastService) { }

  ngOnInit() {
    this.data$ = this.toastService.data$;
    setTimeout(() => { this.toggleToast = true; }, 250);
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

}
