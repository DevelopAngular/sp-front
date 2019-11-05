import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MySchoolRoutingModule } from './my-school-routing.module';
import { MySchoolComponent } from './my-school.component';
import { SharedModule } from '../../shared/shared.module';
import { SchoolButtonComponent } from './school-button/school-button.component';
import {AdminSharedModule} from '../shared/admin-shared.module';

@NgModule({
  declarations: [
    MySchoolComponent,
    SchoolButtonComponent
  ],
  imports: [
    CommonModule,
    MySchoolRoutingModule,
    SharedModule,
    AdminSharedModule
  ]
})
export class MySchoolModule { }
