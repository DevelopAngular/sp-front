import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { finalize, take, tap } from 'rxjs/operators';

@Component({
	selector: 'sp-timer-spinner',
	templateUrl: './timer-spinner.component.html',
	styleUrls: ['./timer-spinner.component.scss'],
})
export class TimerSpinnerComponent implements OnInit {
	@Input() showNumber = true;
	@Input() private maxSeconds;
	@Input() private startAt: number;
	@Output() private pulse = new EventEmitter<number>();
	@Output() private completed = new EventEmitter<void>();

	countdown: number;
	timerSubscription: Subscription;

	ngOnInit(): void {
		if (!this.startAt) {
			this.startAt = this.maxSeconds;
		}
		this.countdown = this.startAt > 0 ? this.startAt : this.maxSeconds;
		this.timerSubscription = this.createTimer(this.startAt).subscribe();
	}

	private createTimer(seconds: number) {
		return timer(0, 1000).pipe(
			take(seconds + 1),
			tap((counter) => {
				const remaining = seconds - counter;
				this.countdown = remaining;
				this.pulse.emit(remaining);
			}),
			finalize(() => this.completed.emit())
		); // emit when counter finishes
	}

	get remainingPercentage(): number {
		return (this.countdown / this.maxSeconds) * 100;
	}

	public reset(overrideSeconds?: number) {
		if (this.timerSubscription) {
			this.timerSubscription.unsubscribe();
		}
		if (overrideSeconds) {
			this.maxSeconds = overrideSeconds;
		}
		this.countdown = this.maxSeconds;
		this.timerSubscription = this.createTimer(this.maxSeconds).subscribe();
	}
}
