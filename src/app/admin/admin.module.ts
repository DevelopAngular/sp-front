import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AdminRoutingModule } from './admin-routing.module';

import { AdminPageComponent } from './admin-page/admin-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HallmonitorComponent } from './hallmonitor/hallmonitor.component';
import { SearchComponent } from './search/search.component';
import { PassConfigComponent } from './pass-config/pass-config.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { SupportComponent } from './support/support.component';
import { SharedModule } from '../shared/shared.module';
import { AdminSharedModule } from './shared/admin-shared.module';
import { AccountsComponent } from './accounts/accounts.component';
import { AccountsRoleComponent } from './accounts-role/accounts-role.component';
import {AccountsDialogComponent} from './accounts-dialog/accounts-dialog.component';;
import { ProfilesSearchComponent } from './profiles-search/profiles-search.component'

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule,
    AdminSharedModule,
  ],
  declarations: [
    AdminPageComponent,
    DashboardComponent,
    HallmonitorComponent,
    SearchComponent,
    PassConfigComponent,
    FeedbackComponent,
    SupportComponent,
    AccountsDialogComponent,
    AccountsComponent,
    AccountsRoleComponent ,
    ProfilesSearchComponent ],
  entryComponents: [AccountsDialogComponent],
  providers: [
      //NavbarDataService
  ],
})
export class AdminModule {
}
