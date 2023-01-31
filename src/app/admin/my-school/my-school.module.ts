import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MySchoolRoutingModule } from './my-school-routing.module';
import { MySchoolComponent } from './my-school.component';
import { SchoolButtonComponent } from './school-button/school-button.component';
import { AdminSharedModule } from '../shared/admin-shared.module';
import { SchoolSettingsComponent } from './school-settings/school-settings.component';
import { DateChipComponent } from './date-chip/date-chip.component';
import { LinkCardComponent } from './link-card/link-card.component';
import { TimeZoneService } from '../../services/time-zone.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [MySchoolComponent, SchoolButtonComponent, SchoolSettingsComponent, DateChipComponent, LinkCardComponent],
	imports: [CommonModule, MySchoolRoutingModule, AdminSharedModule, ReactiveFormsModule, FormsModule],
	entryComponents: [SchoolSettingsComponent],
	providers: [{ provide: 'TimeZoneService', useClass: TimeZoneService }],
})
export class MySchoolModule {}
