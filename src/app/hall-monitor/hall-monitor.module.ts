import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HallMonitorRoutingModule } from './hall-monitor-routing.module';
import { HallMonitorComponent } from './hall-monitor.component';
import { SharedModule } from '../shared/shared.module';
import { ReportSuccessToastComponent } from '../report-success-toast/report-success-toast.component';

@NgModule({
  declarations: [
    HallMonitorComponent,
    ReportSuccessToastComponent,
  ],
  imports: [
    CommonModule,
    HallMonitorRoutingModule,
    SharedModule
  ],
  entryComponents: [ReportSuccessToastComponent]
})
export class HallMonitorModule { }
