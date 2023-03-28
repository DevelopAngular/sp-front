import { Component, Input, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';

@Component({
	selector: 'app-countdown',
	templateUrl: './countdown.component.html',
	styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit {
	@Input() dateFuture: string;
	private subscription: Subscription;

	milliSecondsInASecond = 1000;
	hoursInADay = 24;
	minutesInAnHour = 60;
	SecondsInAMinute = 60;

	public timeDifference;
	public secondsTo;
	public minutesTo;
	public hoursTo;
	public daysTo;

	constructor() {}

	private getTimeDifference() {
		const futureTime = new Date(this.dateFuture);
		this.timeDifference = futureTime.getTime() - new Date().getTime();
		this.allocateTimeUnits(this.timeDifference);
	}

	private allocateTimeUnits(timeDifference) {
		this.secondsTo = Math.floor((timeDifference / this.milliSecondsInASecond) % this.SecondsInAMinute);
		this.minutesTo = Math.floor((timeDifference / (this.milliSecondsInASecond * this.minutesInAnHour)) % this.SecondsInAMinute);
		this.hoursTo = Math.floor((timeDifference / (this.milliSecondsInASecond * this.minutesInAnHour * this.SecondsInAMinute)) % this.hoursInADay);
		this.daysTo = Math.floor(timeDifference / (this.milliSecondsInASecond * this.minutesInAnHour * this.SecondsInAMinute * this.hoursInADay));
	}

	ngOnInit() {
		this.subscription = interval(this.milliSecondsInASecond).subscribe(() => {
			this.getTimeDifference();
		});
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	firstDigit(num: number): number {
		return Math.floor((num % 100) / 10);
	}

	secondDigit(num): number {
		return num % 10;
	}
}
