import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http-service';
import { filter, map } from 'rxjs/operators';

@Component({
	selector: 'sp-trial-bar',
	templateUrl: './trial-bar.component.html',
	styleUrls: ['./trial-bar.component.scss'],
})
export class TrialBarComponent implements OnInit {
	todaysDate: Date;

	private oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

	constructor(private http: HttpService) {
		this.todaysDate = new Date();
	}

	trialData$ = this.http.currentSchoolSubject.pipe(
		filter((school) => !!school?.trial_end_date),
		map((school) => {
			const trialEndDate = this.getRealEndDate(new Date(school.trial_end_date));
			const daysUntil = this.getDaysUntil(trialEndDate);
			const quoteLink = school?.trial_quote_link;

			return {
				trialEndDate: trialEndDate,
				daysUntil: daysUntil,
				quoteLink: quoteLink,
			};
		})
	);

	ngOnInit(): void {}

	// We want the trial to end at the end of the day specified by |trial_end_date|
	getRealEndDate(endDate: Date): Date {
		const day = this.oneDay - 1;
		const realEndDate = new Date(endDate.getTime() + day);
		return realEndDate;
	}

	getDaysUntil(endDate: Date): number {
		const diffDays = Math.round(Math.abs((endDate.getTime() - this.todaysDate.getTime()) / this.oneDay));
		return diffDays;
	}
}
