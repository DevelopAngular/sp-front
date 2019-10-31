﻿import { CommonModule, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';
import { AccountsRoleComponent } from './accounts-role/accounts-role.component';
import { AccountsComponent } from './accounts/accounts.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HallmonitorComponent } from './hallmonitor/hallmonitor.component';
import { LinkGeneratedDialogComponent } from './link-generated-dialog/link-generated-dialog.component';
import { PassConfigComponent } from './pass-config/pass-config.component';
import { PdfGeneratorService } from './pdf-generator.service';
import { SearchComponent } from './search/search.component';
import { SettingsComponent } from './settings/settings.component';
import { AdminSharedModule } from './shared/admin-shared.module';
import { ColumnsConfigDialogComponent } from './columns-config-dialog/columns-config-dialog.component';
import { SchoolSettingDialogComponent } from './school-setting-dialog/school-setting-dialog.component';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import { SearchFilterDialogComponent } from './search/search-filter-dialog/search-filter-dialog.component';
import { DateTimeFilterComponent } from './search/date-time-filter/date-time-filter.component';
import { MySchoolComponent } from './my-school/my-school.component';
import { RoomsSetUpComponent } from './pass-config/rooms-set-up/rooms-set-up.component';
import { SchoolButtonComponent } from './my-school/school-button/school-button.component';
import { AdminCardButtonComponent } from './accounts/admin-card-button/admin-card-button.component';
import { IosComponentComponent } from './ios-component/ios-component.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule,
    FormsModule,
    AdminSharedModule,
    ChartsModule
  ],
  declarations: [
    AdminPageComponent,
    DashboardComponent,
    HallmonitorComponent,
    SearchComponent,
    PassConfigComponent,
    AccountsComponent,
    AccountsRoleComponent,
    SettingsComponent,
    LinkGeneratedDialogComponent,
    ColumnsConfigDialogComponent,
    SchoolSettingDialogComponent,
    AddUserDialogComponent,
    SearchFilterDialogComponent,
    DateTimeFilterComponent,
    MySchoolComponent,
    RoomsSetUpComponent,
    SchoolButtonComponent,
    AdminCardButtonComponent,
    IosComponentComponent,

  ],
  entryComponents: [
    LinkGeneratedDialogComponent,
    ColumnsConfigDialogComponent,
    SchoolSettingDialogComponent,
    AddUserDialogComponent,
    SettingsComponent,
    SearchFilterDialogComponent,
    DateTimeFilterComponent

  ],
  providers: [
    [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
    PdfGeneratorService,
  ],
})
export class AdminModule {
}
