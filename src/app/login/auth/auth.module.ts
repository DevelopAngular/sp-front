import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { ParentLoginComponent } from './parent-login/parent-login.component';
import { ParentSignUpComponent } from './parent-sign-up/parent-sign-up.component';
import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../core/core.module';


@NgModule({
  declarations: [
    ParentLoginComponent,
    ParentSignUpComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    CoreModule
  ]
})
export class AuthModule { }
