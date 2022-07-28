import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WeblinksRoutingModule } from './weblinks-routing.module';
import { AuthGuardCallbackComponent } from './auth-guard-callback/auth-guard-callback.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [AuthGuardCallbackComponent],
  imports: [
    CommonModule,
    SharedModule,
    WeblinksRoutingModule
  ]
})
export class WeblinksModule { }
