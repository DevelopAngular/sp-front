import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GettingStartedRoutingModule } from './getting-started-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { TakeTourComponent } from './take-tour/take-tour.component';
import { GettingStartedComponent } from './getting-started.component';
import {AdminSharedModule} from '../shared/admin-shared.module';

@NgModule({
  declarations: [
    GettingStartedComponent,
    TakeTourComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AdminSharedModule,
    GettingStartedRoutingModule
  ]
})
export class GettingStartedModule { }
