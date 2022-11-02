import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentInfoRoutingModule } from './student-info-routing.module';
import { StudentInfoComponent } from './student-info.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [StudentInfoComponent],
  imports: [
    CommonModule,
    StudentInfoRoutingModule,
    SharedModule,
  ]
})
export class StudentInfoModule { }
