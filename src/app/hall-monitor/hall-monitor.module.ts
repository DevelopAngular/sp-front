import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HallMonitorRoutingModule } from './hall-monitor-routing.module';
import { HallMonitorComponent } from './hall-monitor.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    HallMonitorComponent
  ],
  imports: [
    CommonModule,
    HallMonitorRoutingModule,
    SharedModule
  ]
})
export class HallMonitorModule { }
