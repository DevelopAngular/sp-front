import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MySchoolRoutingModule } from './my-school-routing.module';
import { MySchoolComponent } from './my-school.component';
import { SchoolButtonComponent } from './school-button/school-button.component';
import { AdminSharedModule } from '../shared/admin-shared.module';
import { SchoolSettingsComponent } from './school-settings/school-settings.component';
import { DateChipComponent } from './date-chip/date-chip.component';
import { LinkCardComponent } from './link-card/link-card.component';

@NgModule({
  declarations: [
    MySchoolComponent,
    SchoolButtonComponent,
    SchoolSettingsComponent,
    DateChipComponent,
    LinkCardComponent
  ],
  imports: [
    CommonModule,
    MySchoolRoutingModule,
    AdminSharedModule
  ],
  entryComponents: [SchoolSettingsComponent]
})
export class MySchoolModule { }
