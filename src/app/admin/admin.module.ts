import { CommonModule, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatSortModule,
  MatTableModule
} from '@angular/material';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';
import { AccountsDialogComponent } from './accounts-dialog/accounts-dialog.component';
import { AccountsRoleComponent } from './accounts-role/accounts-role.component';
import { AccountsComponent } from './accounts/accounts.component';

import { AdminPageComponent } from './admin-page/admin-page.component';

import { AdminRoutingModule } from './admin-routing.module';
import { CalendarComponent } from './calendar/calendar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DatePrettyHelper } from './date-pretty.helper';
import { FeedbackComponent } from './feedback/feedback.component';
import { HallmonitorComponent } from './hallmonitor/hallmonitor.component';
import { LinkGeneratedDialogComponent } from './link-generated-dialog/link-generated-dialog.component';
import { PassConfigComponent } from './pass-config/pass-config.component';
import { PdfGeneratorService } from './pdf-generator.service';
import { SearchComponent } from './search/search.component';
import { SettingsComponent } from './settings/settings.component';
import { AdminSharedModule } from './shared/admin-shared.module';
import { SupportComponent } from './support/support.component';

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
    SettingsComponent,
    LinkGeneratedDialogComponent
  ],
  entryComponents: [AccountsDialogComponent, CalendarComponent, LinkGeneratedDialogComponent],
  providers: [
    // NavbarDataService
    [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
    PdfGeneratorService,
    DatePrettyHelper
  ],
})
export class AdminModule {
}
