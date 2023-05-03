import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface TeacherReview {
  name: string,
  what_to_display: string,
  stars: number,
  testimonial: string,
  first_shown: string,
}

@Component({
  selector: 'app-teacher-reviews',
  templateUrl: './teacher-reviews.component.html',
  styleUrls: ['./teacher-reviews.component.scss']
})

export class TeacherReviewsComponent implements OnInit {
  teacherReviews$: Observable<TeacherReview[]>;

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.teacherReviews$ = this.getTeacherReviews();
  }


  getTeacherReviews(): Observable<TeacherReview[]> {
    return this.userService.getTeacherReviews().pipe(
      map(reviews => reviews.map(review => ({
        ...review
      }))),
      startWith([])
    );
  }

}


