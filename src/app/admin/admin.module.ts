import {CommonModule, Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {AdminPageComponent} from './admin-page/admin-page.component';
import {AdminRoutingModule} from './admin-routing.module';
import {LinkGeneratedDialogComponent} from './link-generated-dialog/link-generated-dialog.component';
import {SettingsComponent} from './settings/settings.component';
import {AdminSharedModule} from './shared/admin-shared.module';
import {SchoolSettingDialogComponent} from './school-setting-dialog/school-setting-dialog.component';
import {SearchFilterDialogComponent} from './explore/search-filter-dialog/search-filter-dialog.component';
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
import {GeneratedTableDialogComponent} from './sp-data-table/generated-table-dialog/generated-table-dialog.component';

import {StatusPopupComponent} from './profile-card-dialog/status-popup/status-popup.component';
import {EditAvatarComponent} from './profile-card-dialog/edit-avatar/edit-avatar.component';
import {AccountsModule} from './accounts/accounts.module';
import {ProfileCardDialogComponent} from './profile-card-dialog/profile-card-dialog.component';
import {AddUserDialogComponent} from './add-user-dialog/add-user-dialog.component';
import {ViewProfileComponent} from './profile-card-dialog/view-profile/view-profile.component';
import {ModelFilterComponent} from '../student-info-card/model-filter/model-filter.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        AdminRoutingModule,
        FormsModule,
        AdminSharedModule,
        AccountsModule,
    ],
    declarations: [
        AdminPageComponent,
        SettingsComponent,
        LinkGeneratedDialogComponent,
        SchoolSettingDialogComponent,
        SearchFilterDialogComponent,
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
        GeneratedTableDialogComponent,
        StatusPopupComponent,
        EditAvatarComponent,
        ProfileCardDialogComponent,
        AddUserDialogComponent,
        ViewProfileComponent,
        ModelFilterComponent,
    ],
    providers: [
        [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
    ],
})
export class AdminModule {}
