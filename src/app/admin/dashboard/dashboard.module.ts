import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DashboardRoutingModule} from './dashboard-routing.module';
import {DashboardComponent} from './dashboard.component';
import {AdminSharedModule} from '../shared/admin-shared.module';
import {StartPageComponent} from './start-page/start-page.component';
import {StartCardComponent} from './start-page/start-card/start-card.component';
import {DashboardContentComponent} from './dashboard-content/dashboard-content.component';

@NgModule({
  declarations: [
    DashboardComponent,
    StartPageComponent,
    StartCardComponent,
    DashboardContentComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    AdminSharedModule
  ]
})
export class DashboardModule { }
