import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HallmonitorRoutingModule } from './hallmonitor-routing.module';
import { HallmonitorComponent } from './hallmonitor.component';
import { SharedModule } from '../../shared/shared.module';
import {AdminSharedModule} from '../shared/admin-shared.module';
import {DisplayReportCellComponent} from '../../display-report-cell/display-report-cell.component';

@NgModule({
  declarations: [
    HallmonitorComponent,
    DisplayReportCellComponent,
  ],
  imports: [
    CommonModule,
    HallmonitorRoutingModule,
    SharedModule,
    AdminSharedModule
  ]
})
export class HallmonitorModule { }
