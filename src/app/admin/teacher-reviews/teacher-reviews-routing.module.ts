import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeacherReviewsPageComponent } from './teacher-reviews-page/teacher-reviews-page.component';

const routes: Routes = [{ path: '', component: TeacherReviewsPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class TeacherReviewsRoutingModule {}
