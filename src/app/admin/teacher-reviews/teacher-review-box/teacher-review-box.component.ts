import { Component, Input, OnInit } from '@angular/core';

interface TeacherReview {
  name: string,
  what_to_display: string,
  stars: number,
  testimonial: string,
  first_shown: string,
}

@Component({
  selector: 'app-teacher-review-box',
  templateUrl: './teacher-review-box.component.html',
  styleUrls: ['./teacher-review-box.component.scss']
})

export class TeacherReviewBoxComponent implements OnInit {

  @Input() data: TeacherReview;
  numberOfStars: number[];

  constructor(){ }

  ngOnInit(): void {
    this.numberOfStars = Array(this.data.stars);
  }
  
}
