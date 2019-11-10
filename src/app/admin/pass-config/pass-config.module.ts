import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PassConfigRoutingModule } from './pass-config-routing.module';
import { PassConfigComponent } from './pass-config.component';
import { RoomsSetUpComponent } from './rooms-set-up/rooms-set-up.component';
import { AdminSharedModule } from '../shared/admin-shared.module';

@NgModule({
  declarations: [
    PassConfigComponent,
    RoomsSetUpComponent
  ],
  imports: [
    CommonModule,
    PassConfigRoutingModule,
    AdminSharedModule
  ]
})
export class PassConfigModule { }
