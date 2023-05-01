import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherReviewsPageComponent } from './teacher-reviews-page/teacher-reviews-page.component';
import { TeacherReviewsRoutingModule } from './teacher-reviews-routing.module';

@NgModule({
	declarations: [TeacherReviewsPageComponent],
	imports: [CommonModule, TeacherReviewsRoutingModule],
})
export class TeacherReviewsModule {}
