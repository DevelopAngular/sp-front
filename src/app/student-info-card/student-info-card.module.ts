import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentInfoCardRoutingModule } from './student-info-card-routing.module';
import { StudentInfoCardComponent } from './student-info-card.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [StudentInfoCardComponent],
	imports: [CommonModule, StudentInfoCardRoutingModule, SharedModule],
})
export class StudentInfoCardModule {}
