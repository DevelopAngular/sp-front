import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { HttpService } from '../../services/http-service';
import { filter, mergeMap, take } from "rxjs/operators";
import { MatDialog } from '@angular/material/dialog';
import { FeatureFlagService, FLAGS } from '../../services/feature-flag.service';
import { FileDownloadService } from '../../services/file-download-service';
import { UserService } from "../../services/user.service";
import { of } from "rxjs";

@Component({
	selector: 'sp-year-in-review',
	templateUrl: './year-in-review.component.html',
	styleUrls: ['./year-in-review.component.scss'],
})
export class YearInReviewComponent implements OnInit {
	@Input()
	public pdfUrl: URL;

	@Output() yearInReviewEnabled: EventEmitter<boolean> = new EventEmitter<boolean>();
	public yearInReviewPdfUrl: string;

	public title: string;

	constructor(
		private httpService: HttpService,
		private dialogService: MatDialog,
		private featureFlagService: FeatureFlagService,
		private adminService: AdminService,
		private fileDownloadService: FileDownloadService,
		private userService: UserService,
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
				this.yearInReviewPdfUrl = resp.pdf_url;
			}
		});
	}

	downloadPdf() {
		this.fileDownloadService.
		downloadFile(this.yearInReviewPdfUrl, this.title).
		pipe(
			filter(b => !!b),
			mergeMap(() => this.userService.introsData$),
			filter(i => !!i),
			mergeMap( i => {
				if (i.downloaded_year_in_review?.universal?.seen_version) {
					return of(i);
				} else {
					return this.userService.updateIntrosDownloadedYearInReview('universal', '1');
				}
			})
		).
		subscribe();
	}
}
