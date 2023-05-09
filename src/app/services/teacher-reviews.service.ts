import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';
import { HttpService } from './http-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface TeacherReview {
	name: string;
	what_to_display: string;
	stars: number;
	testimonial: string;
	first_shown: string;
}

@Injectable({
	providedIn: 'root',
})
export class TeacherReviewsService {
	constructor(private userService: UserService, private http: HttpClient, private httpService: HttpService) {}

	getReviews(): Observable<TeacherReview[]> {
		return this.http.get('../assets/xlsx/Teacher Survey.csv', { responseType: 'text' }).pipe(
			map((csvRawText) => {
				const lines = csvRawText.split(/\n/);
				let reviews: TeacherReview[] = [];

				for (let i = 1; i < lines.length; i++) {
					const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/; //commas outside of quotes
					const fields = lines[i].split(regex);
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
						this.userService.getUserById(user_id).subscribe((user) => {
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
						});
					}
				}
				return reviews;
			})
		);
	}

	//csv has weird formatting where it added 2 sets of double quotes to all strings
	formatTestimonial(str: string): string {
		if (!str) {
			return '';
		}
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
