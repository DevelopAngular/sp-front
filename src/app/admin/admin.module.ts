import { CommonModule, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminRoutingModule } from './admin-routing.module';
import { LinkGeneratedDialogComponent } from './link-generated-dialog/link-generated-dialog.component';
import { PdfGeneratorService } from './pdf-generator.service';
import { SettingsComponent } from './settings/settings.component';
import { AdminSharedModule } from './shared/admin-shared.module';
import { ColumnsConfigDialogComponent } from './columns-config-dialog/columns-config-dialog.component';
import { SchoolSettingDialogComponent } from './school-setting-dialog/school-setting-dialog.component';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import { SearchFilterDialogComponent } from './search/search-filter-dialog/search-filter-dialog.component';
import { DateTimeFilterComponent } from './search/date-time-filter/date-time-filter.component';
import { IosComponentComponent } from './ios-component/ios-component.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule,
    FormsModule,
    AdminSharedModule,
  ],
  declarations: [
    AdminPageComponent,
    SettingsComponent,
    LinkGeneratedDialogComponent,
    ColumnsConfigDialogComponent,
    SchoolSettingDialogComponent,
    AddUserDialogComponent,
    SearchFilterDialogComponent,
    DateTimeFilterComponent,
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
