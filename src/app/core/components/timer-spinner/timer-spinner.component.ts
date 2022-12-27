import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { timer } from 'rxjs'
import { finalize, take, tap } from 'rxjs/operators'

@Component({
  selector: 'sp-timer-spinner',
  templateUrl: './timer-spinner.component.html',
  styleUrls: ['./timer-spinner.component.scss']
})
export class TimerSpinnerComponent implements OnInit {
  @Input() showNumber = true;
  @Input() private seconds = 30;
  @Output() private pulse = new EventEmitter<number>();
  @Output() private completed = new EventEmitter<void>()

  countdown: number = this.seconds;

  ngOnInit(): void {
    this.createTimer(this.seconds).subscribe();
  }

  private createTimer(seconds: number) {
    return timer(0, 1000).pipe(
      take(this.seconds + 1),
      tap(counter => {
        const remaining = this.seconds - counter;
        this.countdown = remaining;
        this.pulse.emit(remaining);
      }),
      finalize(() => this.completed.emit())); // emit when counter finishes
  }

  get remainingPercentage(): number {
    return this.countdown / this.seconds * 100;
  }

  public reset(overrideSeconds?: number) {
    if (overrideSeconds) {
      this.seconds = overrideSeconds;
    }
    this.countdown = this.seconds;
    this.createTimer(this.seconds).subscribe();
  }
}
