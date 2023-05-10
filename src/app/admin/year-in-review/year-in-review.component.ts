import { Component, Input, OnInit } from "@angular/core";
import { AdminService } from "../../services/admin.service";
import { HttpService } from "../../services/http-service";
import { filter, take } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";

@Component({
	selector: 'sp-year-in-review',
	templateUrl: './year-in-review.component.html',
	styleUrls: ['./year-in-review.component.scss'],
})
export class YearInReviewComponent implements OnInit {

	@Input()
	public pdfUrl: URL;

	public title: string;

	constructor(private httpService: HttpService, private dialogService: MatDialog) {}

	ngOnInit(): void {
		this.httpService.currentSchool$
			.pipe(
				filter(s => !!s),
				take(1)
			).subscribe(s => {
				this.title = `${s.name}'s Year in Review Report`;
		})
	}
}
