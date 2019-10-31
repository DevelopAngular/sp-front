import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HallmonitorRoutingModule } from './hallmonitor-routing.module';
import { HallmonitorComponent } from './hallmonitor.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    HallmonitorComponent
  ],
  imports: [
    CommonModule,
    HallmonitorRoutingModule,
    SharedModule
  ]
})
export class HallmonitorModule { }
