import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { SharedModule } from '../shared/shared.module';
import {CoreModule} from '../core/core.module';
import {AllowMobileService} from '../services/allow-mobile.service';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    SharedModule,
    CoreModule
  ],
  providers: [AllowMobileService],
})
export class LoginModule { }
