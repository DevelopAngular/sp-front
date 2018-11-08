import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NavComponent } from './nav/nav.component';
import { NavButtonComponent } from './nav-button/nav-button.component';
import { HallmonitorComponent } from './hallmonitor/hallmonitor.component';
import { SearchComponent } from './search/search.component';
import { AccountsComponent } from './accounts/accounts.component';
import { AppInputComponent } from './../app-input/app-input.component';
import { PassConfigComponent } from './pass-config/pass-config.component';
import { FormsModule } from '@angular/forms';
import { OverlayContainerComponent } from './overlay-container/overlay-container.component'
import {CardButtonComponent} from '../card-button/card-button.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule,
    FormsModule,

  ],
  declarations: [
    AdminPageComponent,
    DashboardComponent,
    NavComponent,
    NavButtonComponent,
    HallmonitorComponent,
    SearchComponent,
    AccountsComponent,
    PassConfigComponent,
    AppInputComponent,
    CardButtonComponent
  ],
  providers: [
      //NavbarDataService
  ],
})
export class AdminModule {
}
