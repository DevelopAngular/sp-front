import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../services/http-service';

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
	teacherReviews: TeacherReview[];

	constructor(private userService: UserService, private http: HttpClient, private httpService: HttpService) {}

	ngOnInit(): void {
		this.getReviews((reviews) => {
			this.teacherReviews = reviews;
		});
	}

	getReviews(callback: (reviews: TeacherReview[]) => void) {
		let reviews: TeacherReview[] = [];

		//../assets/xlsx/Staff Review Test.csv' <-- test file for local env
		this.http.get('../assets/xlsx/Teacher Survey.csv', { responseType: 'text' }).subscribe({
			next: (csvRawText) => {
				const lines = csvRawText.split(/\n/);
				for (let i = 1; i < lines.length; i++) {
					const fields = lines[i].split(',');
					//const response_id = fields[0];
					const what_to_display = fields[1];
					const school_id = fields[2];
					//const email = fields[3];
					const do_not_share = fields[4];
					const user_id = fields[5];
					const stars = parseInt(fields[6]);
					const testimonial = this.formatTestimonial(fields[7]); //strip first 2 and last 2 double quotes because of .csv formatting after converting from .numbers
					const first_shown = this.formatDate(fields[8]);

					if (this.httpService.getSchool().id == school_id && !do_not_share) {
						const subscription = this.userService.getUserById(user_id).subscribe((user) => {
							if (user && user.roles.includes('_profile_teacher')) {
								const review: TeacherReview = {
									name: user.display_name,
									what_to_display: what_to_display,
									stars: stars,
									testimonial: testimonial,
									first_shown: first_shown,
								};

								reviews.push(review);
							}
							subscription.unsubscribe();
						});
					}
				}
				callback(reviews);
			},
		});
	}

	//csv has weird formatting where it added 2 sets of double quotes to all strings
	formatTestimonial(str: string): string {
		if (str) {
			const firstIndex = str.indexOf('"');
			const lastIndex = str.lastIndexOf('"');
			if (firstIndex >= 0 && lastIndex >= 0 && firstIndex !== lastIndex) {
				const secondIndex = str.indexOf('"', firstIndex + 1);
				const secondLastIndex = str.lastIndexOf('"', lastIndex - 1);
				if (secondIndex >= 0 && secondLastIndex >= 0) {
					return str.slice(firstIndex + 1, secondIndex) + str.slice(secondIndex + 1, secondLastIndex) + str.slice(lastIndex + 1);
				}
			}
			return str;
		} else {
			return '';
		}
	}

	formatDate(dateString: string): string {
		if (dateString) {
			const date = new Date(dateString.split(' ')[0]);
			return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
		} else {
			return '';
		}
	}
}
