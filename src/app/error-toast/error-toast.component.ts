import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';

@Component({
  selector: 'app-error-toast',
  templateUrl: './error-toast.component.html',
  styleUrls: ['./error-toast.component.scss']
})
export class ErrorToastComponent implements OnInit {

  @Input() errorHeader: string = 'Server Error.';
  @Input() errorMessage: string = 'Operation could not be completed. We’re working on a solution.';

  @Output() closeEvent = new EventEmitter<boolean>();

  public toggleToast: boolean;

  constructor() { }

  ngOnInit() {
    setTimeout(() => { this.toggleToast = true; }, 250);
  }
  close(evt: Event) {
    evt.stopPropagation();
    this.toggleToast = false;
    of(null).pipe(
      delay(1000)
    ).subscribe(() => {
      this.closeEvent.emit(false);
    });
  }
}
