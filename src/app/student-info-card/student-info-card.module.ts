import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {StudentInfoCardRoutingModule} from './student-info-card-routing.module';
import {StudentInfoCardComponent} from './student-info-card.component';
import {SharedModule} from '../shared/shared.module';
import {OverviewContainerComponent} from './student-passes-overwiew/overview-container.component';


@NgModule({
  declarations: [
    StudentInfoCardComponent,
    OverviewContainerComponent,
  ],
  imports: [
    CommonModule,
    StudentInfoCardRoutingModule,
    SharedModule,
  ]
})
export class StudentInfoCardModule { }
