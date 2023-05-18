import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { filter, mergeMap, take } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { FeatureFlagService, FLAGS } from '../../services/feature-flag.service';
import { FileDownloadService } from '../../services/file-download-service';
import { UserService } from '../../services/user.service';
import { HttpService } from '../../services/http-service';
import { TeacherReviewsService } from '../../services/teacher-reviews.service';
import { Observable, of } from 'rxjs';

interface TeacherReview {
	name: string;
	what_to_display: string;
	stars: number;
	testimonial: string;
	first_shown: string;
}

@Component({
	selector: 'app-nux-insights',
	templateUrl: './nux-insights.component.html',
	styleUrls: ['./nux-insights.component.scss'],
})
export class NuxInsightsComponent implements OnInit {
	isAdmin: boolean;
	@Input()
	public pdfUrl: URL;

	@Output() yearInReviewEnabled: EventEmitter<boolean> = new EventEmitter<boolean>();
	public yearInReviewPdfUrl: string;
	public schoolName: string;
	teacherReviews$: Observable<TeacherReview[]>;
	public hasYearInReviewPdf = true;

	constructor(
		private featureFlagService: FeatureFlagService,
		private adminService: AdminService,
		public dialogRef: MatDialogRef<NuxInsightsComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { isAdmin: boolean },
		private fileDownloadService: FileDownloadService,
		private userService: UserService,
		private teacherReviewsService: TeacherReviewsService,
		private httpService: HttpService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.httpService.currentSchool$
			.pipe(
				filter((s) => !!s),
				take(1)
			)
			.subscribe((s) => {
				this.schoolName = s.name;
			});

		this.isAdmin = this.data.isAdmin;
		this.teacherReviews$ = this.teacherReviewsService.getReviews();
		this.getYearInReviewData();

		// Mark intros nux as seen.
		this.userService.introsData$
			.pipe(
				filter((i) => !!i),
				take(1)
			)
			.subscribe((intros) => {
				this.userService.updateIntrosSeenInsightsNuxRequest(intros, 'universal', '1');
			});
	}

	getYearInReviewData() {
		if (!this.featureFlagService.isFeatureEnabledV2(FLAGS.YearInReview)) {
			this.yearInReviewEnabled.emit(false);
			return;
		}

		this.adminService.getYearInReviewData().subscribe((resp) => {
			this.yearInReviewEnabled.emit(!!resp.pdf_url);
			if (resp.pdf_url) {
				this.yearInReviewPdfUrl = resp.pdf_url;
			}
		});
	}

	downloadPdf() {
		this.fileDownloadService
			.downloadFile(this.yearInReviewPdfUrl, `${this.schoolName}'s Year in Review Report`)
			.pipe(
				filter((b) => !!b),
				mergeMap(() => this.userService.introsData$),
				filter((i) => !!i),
				mergeMap((i) => {
					if (i.downloaded_year_in_review?.universal?.seen_version) {
						return of(i);
					} else {
						return this.userService.updateIntrosDownloadedYearInReview('universal', '1');
					}
				})
			)
			.subscribe();
	}

	get isTeacherReviewsEnabled() {
		return this.featureFlagService.isFeatureEnabledV2(FLAGS.TeacherReviews);
	}

	get isYearInReviewEnabled() {
		return this.featureFlagService.isFeatureEnabledV2(FLAGS.YearInReview);
	}
}
