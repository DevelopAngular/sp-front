import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KioskModeRoutingModule } from './kiosk-mode-routing.module';
import { KioskModeComponent } from './kiosk-mode.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    KioskModeComponent
  ],
  imports: [
    CommonModule,
    KioskModeRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class KioskModeModule { }
