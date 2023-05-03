import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-teacher-reviews-text',
  templateUrl: './teacher-reviews-text.component.html',
  styleUrls: ['./teacher-reviews-text.component.scss']
})
export class TeacherReviewsTextComponent implements OnInit {
  @Input() whatToDisplay: string;
  @Input() testimonial: string;

  constructor() { }

  ngOnInit(): void {
  }

}
