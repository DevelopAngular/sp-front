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
import { PassCongifComponent } from './pass-congif/pass-congif.component';
import { AppInputComponent } from './../app-input/app-input.component';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { DateTimePickerComponent } from './../date-time-picker/date-time-picker.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
      AdminRoutingModule,
      OwlDateTimeModule,
      OwlNativeDateTimeModule,
      FormsModule
  ],
  declarations: [
    AdminPageComponent,
    DashboardComponent,
    NavComponent,
    NavButtonComponent,
    HallmonitorComponent,
    SearchComponent,
    AccountsComponent,
    PassCongifComponent,
      AppInputComponent,
      DateTimePickerComponent
  ],
  providers: [
      //NavbarDataService
  ]
})
export class AdminModule {
}
