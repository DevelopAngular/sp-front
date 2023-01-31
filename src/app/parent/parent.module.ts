import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParentRoutingModule } from './parent-routing.module';
import { ParentPageComponent } from './parent-page/parent-page.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParentInviteCodeDialogComponent } from './parent-invite-code-dialog/parent-invite-code-dialog.component';
import { ParentNavbarComponent } from './parent-navbar/parent-navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ParentSettingComponent } from './parent-setting/parent-setting.component';
import { RemoveStudentComponent } from './remove-student/remove-student.component';

@NgModule({
	declarations: [
		ParentPageComponent,
		ParentInviteCodeDialogComponent,
		ParentNavbarComponent,
		DashboardComponent,
		ParentSettingComponent,
		RemoveStudentComponent,
	],
	imports: [CommonModule, ParentRoutingModule, SharedModule, FormsModule, ReactiveFormsModule],
})
export class ParentModule {}
