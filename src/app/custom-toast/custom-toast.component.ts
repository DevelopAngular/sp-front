import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {interval, merge, of, Subject, timer} from 'rxjs';
import {delay, filter, takeUntil, tap} from 'rxjs/operators';
import {ToastService} from '../services/toast.service';
import {Toast} from '../models/Toast';
import {toastSlideInOut} from '../animations';
import {User} from '../models/User';

const TOASTDELAY = (6 * 1000) - 200;

@Component({
  selector: 'app-custom-toast',
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss'],
  animations: [
    toastSlideInOut,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomToastComponent implements OnInit, OnDestroy {

  @Input() toast: any;
  @Input() indexPosition: number;
  @Input() user: User;

  toggleToast: boolean;
  cancelable: boolean = true;
  data: Toast;
  timerValue: number;
  animationTrigger: string;
  stopPosition: boolean;

  destroy$: Subject<any> = new Subject<any>();
  destroyClose$: Subject<any> = new Subject<any>();

  constructor(
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.data = this.toast.data;
    setTimeout(() => {
      this.toggleToast = true;
      this.cdr.detectChanges();
    }, 250);

    merge(of(1), interval(1000)).pipe(takeUntil(this.destroyClose$))
      .subscribe(seconds => this.timerValue = seconds > 1 ? seconds + 1 : 1);

    timer(TOASTDELAY)
      .pipe(
        takeUntil(this.destroyClose$),
        filter(() => !this.data.showButton && !this.data.encounterPrevention),
        tap(() => {
          this.toggleToast = false;
          this.cdr.detectChanges();
        }),
        delay(200),
      ).subscribe(() => {
        this.toastService.closeToast([this.toast.id]);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // getTeacherEncounterString() {
  //   return this.data.issuer.display_name + ' cannot have a pass at the same time as' +
  //     this.data.exclusionGroupStudents[0].display_name +
  //     (this.data.exclusionGroupStudents.length > 1 ? (' and ' + this.data.exclusionGroupStudents[1].display_name + '.') : '');
  // }

  close(evt?: Event) {
    if (evt) {
      this.toggleToast = false;
      evt.stopPropagation();
      setTimeout(() => {
        this.toastService.closeToast([this.toast.id]);
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
    this.stopPosition = true;
  }

  leave() {
    if (!this.data.showButton && !this.data.encounterPrevention) {
      of(null).pipe(
        delay(TOASTDELAY - (this.timerValue * 1000)),
        takeUntil(this.destroyClose$),
        tap(() => {
          this.toggleToast = false;
          this.cdr.detectChanges();
        }),
        delay(200),
      ).subscribe(() => {
        this.toastService.closeToast([this.toast.id]);
      });
    }
  }
}
