import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TeacherReviewsService } from '../../../services/teacher-reviews.service';

interface TeacherReview {
	name: string;
	what_to_display: string;
	stars: number;
	testimonial: string;
	first_shown: string;
}

@Component({
	selector: 'app-teacher-reviews',
	templateUrl: './teacher-reviews.component.html',
	styleUrls: ['./teacher-reviews.component.scss'],
})
export class TeacherReviewsComponent implements OnInit {
	teacherReviews$: Observable<TeacherReview[]>;

	constructor(private teacherReviewsService: TeacherReviewsService) {}

	ngOnInit(): void {
		this.teacherReviews$ = this.teacherReviewsService.getReviews();
	}
}
