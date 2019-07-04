import { CommonModule, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule, MatDividerModule,
    MatGridListModule,
    MatIconModule,
    MatSortModule,
    MatTableModule
} from '@angular/material';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';
import { AccountsRoleComponent } from './accounts-role/accounts-role.component';
import { AccountsComponent } from './accounts/accounts.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DatePrettyHelper } from './date-pretty.helper';
import { HallmonitorComponent } from './hallmonitor/hallmonitor.component';
import { LinkGeneratedDialogComponent } from './link-generated-dialog/link-generated-dialog.component';
import { PassConfigComponent } from './pass-config/pass-config.component';
import { PdfGeneratorService } from './pdf-generator.service';
import { SearchComponent } from './search/search.component';
import { SettingsComponent } from './settings/settings.component';
import { AdminSharedModule } from './shared/admin-shared.module';
import { ColumnsConfigDialogComponent } from './columns-config-dialog/columns-config-dialog.component';
import { SchoolSettingDialogComponent } from './school-setting-dialog/school-setting-dialog.component';
import { ProfileCardDialogComponent } from './profile-card-dialog/profile-card-dialog.component';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import { SearchFilterDialogComponent } from './search/search-filter-dialog/search-filter-dialog.component';
import { DateTimeFilterComponent } from './search/date-time-filter/date-time-filter.component';
import { MySchoolComponent } from './my-school/my-school.component';
import { RoomsSetUpComponent } from './pass-config/rooms-set-up/rooms-set-up.component';
import { SchoolButtonComponent } from './my-school/school-button/school-button.component';
import { AdminCardButtonComponent } from './accounts/admin-card-button/admin-card-button.component';


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
    MatDividerModule,
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
    ProfileCardDialogComponent,
    SchoolSettingDialogComponent,
    AddUserDialogComponent,
    SearchFilterDialogComponent,
    DateTimeFilterComponent,
    MySchoolComponent,
    RoomsSetUpComponent,
    SchoolButtonComponent,
    AdminCardButtonComponent,
  ],
  entryComponents: [
    LinkGeneratedDialogComponent,
    ColumnsConfigDialogComponent,
    ProfileCardDialogComponent,
    SchoolSettingDialogComponent,
    AddUserDialogComponent,
    SettingsComponent,
    SearchFilterDialogComponent,
    DateTimeFilterComponent

  ],
  providers: [
    [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
    PdfGeneratorService,
    DatePrettyHelper
  ],
})
export class AdminModule {
}
