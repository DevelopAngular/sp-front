import { Component, Input, OnInit } from '@angular/core'
import { timer } from 'rxjs'
import { take } from 'rxjs/operators'

@Component({
  selector: 'sp-timer-spinner',
  templateUrl: './timer-spinner.component.html',
  styleUrls: ['./timer-spinner.component.scss']
})
export class TimerSpinnerComponent implements OnInit {
  @Input() seconds = 30;
  @Input() showNumber = true;

  countdown: number = this.seconds;

  ngOnInit(): void {
    timer(0, 1000).pipe(
      take(this.seconds + 1)
    ).subscribe({
      next: counter => this.countdown = this.seconds - counter
    })
  }

  get remainingPercentage(): number {
    return this.countdown / this.seconds * 100;
  }
}
