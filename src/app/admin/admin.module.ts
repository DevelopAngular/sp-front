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
import { IosComponentComponent } from './ios-component/ios-component.component';
import {SearchFilterDialogComponent} from './search/search-filter-dialog/search-filter-dialog.component';
import {DateTimeFilterComponent} from './search/date-time-filter/date-time-filter.component';
import {RoomsSearchComponent} from '../rooms-search/rooms-search.component';
import {AdvancedOptionsComponent} from './overlay-container/advanced-options/advanced-options.component';
import {AddExistingRoomComponent} from './overlay-container/add-existing-room/add-existing-room.component';
import {RoomComponent} from './overlay-container/room/room.component';
import {FolderComponent} from './overlay-container/folder/folder.component';
import {NewRoomInFolderComponent} from './overlay-container/new-room-in-folder/new-room-in-folder.component';
import {EditRoomInFolderComponent} from './overlay-container/edit-room-in-folder/edit-room-in-folder.component';
import {BulkEditRoomsComponent} from './overlay-container/bulk-edit-rooms/bulk-edit-rooms.component';
import {BulkEditRoomsInFolderComponent} from './overlay-container/bulk-edit-rooms-in-folder/bulk-edit-rooms-in-folder.component';
import {ImportRoomsComponent} from './overlay-container/import-rooms/import-rooms.component';
import {OverlayContainerComponent} from './overlay-container/overlay-container.component';
import { CustomTableComponent } from './custom-table/custom-table.component';
import { SpDataTableComponent } from './sp-data-table/sp-data-table.component';


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
    IosComponentComponent,
    SearchFilterDialogComponent,
    DateTimeFilterComponent,
    RoomsSearchComponent,
    AdvancedOptionsComponent,
    AddExistingRoomComponent,
    RoomComponent,
    FolderComponent,
    NewRoomInFolderComponent,
    EditRoomInFolderComponent,
    BulkEditRoomsComponent,
    BulkEditRoomsInFolderComponent,
    ImportRoomsComponent,
    OverlayContainerComponent,
    CustomTableComponent,
    SpDataTableComponent
    ],
  entryComponents: [
    LinkGeneratedDialogComponent,
    ColumnsConfigDialogComponent,
    SchoolSettingDialogComponent,
    AddUserDialogComponent,
    SettingsComponent,
    SearchFilterDialogComponent,
    DateTimeFilterComponent,
    OverlayContainerComponent,
  ],
  providers: [
    [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
    PdfGeneratorService,
  ],
  exports: [
    CustomTableComponent,
    SpDataTableComponent
  ]
})
export class AdminModule {
}
