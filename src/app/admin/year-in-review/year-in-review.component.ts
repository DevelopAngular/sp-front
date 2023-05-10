import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { HttpService } from '../../services/http-service';
import { filter, take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { FeatureFlagService, FLAGS } from '../../services/feature-flag.service';

@Component({
	selector: 'sp-year-in-review',
	templateUrl: './year-in-review.component.html',
	styleUrls: ['./year-in-review.component.scss'],
})
export class YearInReviewComponent implements OnInit {
	@Input()
	public pdfUrl: URL;

	public title: string;

	// public hasYearInReviewPdf: boolean;
	@Output() yearInReviewEnabled: EventEmitter<boolean> = new EventEmitter<boolean>();
	public yearInReviewPdfUrl: URL;

	constructor(
		private httpService: HttpService,
		private dialogService: MatDialog,
		private featureFlagService: FeatureFlagService,
		private adminService: AdminService
	) {}

	ngOnInit(): void {
		this.httpService.currentSchool$
			.pipe(
				filter((s) => !!s),
				take(1)
			)
			.subscribe((s) => {
				this.title = `${s.name}'s Year in Review Report`;
			});

		this.getYearInReviewData();
	}

	getYearInReviewData() {
		if (!this.featureFlagService.isFeatureEnabledV2(FLAGS.YearInReview)) {
			this.yearInReviewEnabled.emit(false);
			return;
		}

		this.adminService.getYearInReviewData().subscribe((resp) => {
			this.yearInReviewEnabled.emit(!!resp.pdf_url);
			if (!!resp.pdf_url) {
				this.yearInReviewPdfUrl = new URL(resp.pdf_url);
			}
		});
	}
}
