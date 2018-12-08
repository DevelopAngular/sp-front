import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  MatDialogModule,
  MatTableModule,
  MatCheckboxModule,
  MatSortModule,
  MatGridListModule,
  MatChipsModule,
  MatIconModule
} from '@angular/material';

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
import { FormsModule } from '@angular/forms';
import { AccountsDialogComponent } from './accounts-dialog/accounts-dialog.component';
import { ChartsModule } from 'ng2-charts';
import { CalendarComponent } from './calendar/calendar.component';
import {PdfGeneratorService} from './pdf-generator.service';
import {DatePrettyHelper} from './date-pretty.helper';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatGridListModule,
    MatDialogModule,
    MatChipsModule,
    MatIconModule,
    AdminSharedModule,
    ChartsModule
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
    AccountsRoleComponent,
    CalendarComponent,
  ],

  entryComponents: [AccountsDialogComponent, CalendarComponent],
  providers: [
      //NavbarDataService
    PdfGeneratorService,
    DatePrettyHelper
  ],
})
export class AdminModule {
}
