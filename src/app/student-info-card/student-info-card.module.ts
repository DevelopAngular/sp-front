import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {StudentInfoCardRoutingModule} from './student-info-card-routing.module';
import {StudentInfoCardComponent} from './student-info-card.component';
import {SharedModule} from '../shared/shared.module';
import {OverviewContainerComponent} from './student-passes-overwiew/overview-container.component';
import {DateButtonComponent} from './date-button/date-button.component';


@NgModule({
  declarations: [
    StudentInfoCardComponent,
    OverviewContainerComponent,
    DateButtonComponent,
  ],
  imports: [
    CommonModule,
    StudentInfoCardRoutingModule,
    SharedModule,
  ]
})
export class StudentInfoCardModule { }
