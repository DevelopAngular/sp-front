import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherReviewsPageComponent } from './teacher-reviews-page/teacher-reviews-page.component';
import { TeacherReviewsRoutingModule } from './teacher-reviews-routing.module';
import { TeacherReviewHeaderComponent } from './teacher-review-header/teacher-review-header.component';
import { SharedModule } from '../../shared/shared.module';
import { TeacherReviewBoxComponent } from './teacher-review-box/teacher-review-box.component';
import { TeacherReviewsComponent } from './teacher-reviews/teacher-reviews.component';
import { TeacherReviewsTextComponent } from './teacher-reviews-text/teacher-reviews-text.component';

@NgModule({
	declarations: [
		TeacherReviewsPageComponent,
		TeacherReviewHeaderComponent,
		TeacherReviewBoxComponent,
		TeacherReviewsComponent,
		TeacherReviewsTextComponent,
	],
	imports: [CommonModule, SharedModule, TeacherReviewsRoutingModule],
})
export class TeacherReviewsModule {}
