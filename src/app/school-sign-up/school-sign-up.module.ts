import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchoolSignUpRoutingModule } from './school-sign-up-routing.module';
import { SchoolSignUpComponent } from './school-sign-up.component';
import { SharedModule } from '../shared/shared.module';
import {CoreModule} from '../core/core.module';

@NgModule({
  declarations: [
    SchoolSignUpComponent
  ],
  imports: [
    CommonModule,
    SchoolSignUpRoutingModule,
    SharedModule,
    CoreModule
  ]
})
export class SchoolSignUpModule { }
