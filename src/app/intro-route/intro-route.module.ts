import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IntroRouteRoutingModule } from './intro-route-routing.module';
import { IntroRouteComponent } from './intro-route.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    IntroRouteComponent
  ],
  imports: [
    CommonModule,
    IntroRouteRoutingModule,
    SharedModule
  ]
})
export class IntroRouteModule { }
