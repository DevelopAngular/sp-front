import { AdminService } from '../services/admin.service';
import { filter, mergeMap } from 'rxjs/operators';
import { FileDownloadService } from '../services/file-download-service';
import { UserService } from '../services/user.service';
import { of } from 'rxjs';

export class YearInReviewService {
	public yearInReviewPdfUrl: string;
	public title: string;

	constructor(private adminService: AdminService, private fileDownloadService: FileDownloadService, private userService: UserService) {}

	getYearInReviewData(): string {
		this.adminService.getYearInReviewData().subscribe((resp) => {
			if (resp.pdf_url) {
				return resp.pdf_url;
			}
		});
		return '';
	}

	hasPdfUrl(): boolean {
		this.adminService.getYearInReviewData().subscribe((resp) => {
			if (resp.pdf_url) {
				return true;
			}
		});
		return false;
	}

	downloadPdf() {
		this.fileDownloadService
			.downloadFile(this.yearInReviewPdfUrl, this.title)
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
}
