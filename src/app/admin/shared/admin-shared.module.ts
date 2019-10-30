import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../data-table/data-table.component';
import { NavComponent } from '../nav/nav.component';
import { NavButtonComponent } from '../nav-button/nav-button.component';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import { PinnableCollectionComponent } from '../pinnable-collection/pinnable-collection.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import {
  MatCheckboxModule,
  MatDialogModule,
  MatGridListModule,
  MatSortModule,
  MatTableModule,
  MatListModule,
  MatDividerModule,
  MatChipsModule,
  MatIconModule,
  MatTooltipModule
} from '@angular/material';
import { IconPickerComponent } from '../icon-picker/icon-picker.component';
import { ColorPalletPickerComponent } from '../color-pallet-picker/color-pallet-picker.component';
import { ColorComponent } from '../color-pallet-picker/color/color.component';
import { AdvancedOptionsComponent } from '../overlay-container/advanced-options/advanced-options.component';
import { AddExistingRoomComponent } from '../overlay-container/add-existing-room/add-existing-room.component';
import { RoomComponent } from '../overlay-container/room/room.component';
import { FolderComponent } from '../overlay-container/folder/folder.component';
import { NewRoomInFolderComponent } from '../overlay-container/new-room-in-folder/new-room-in-folder.component';
import { EditRoomInFolderComponent } from '../overlay-container/edit-room-in-folder/edit-room-in-folder.component';
import { BulkEditRoomsComponent } from '../overlay-container/bulk-edit-rooms/bulk-edit-rooms.component';
import { BulkEditRoomsInFolderComponent } from '../overlay-container/bulk-edit-rooms-in-folder/bulk-edit-rooms-in-folder.component';
import {ImportRoomsComponent} from '../overlay-container/import-rooms/import-rooms.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatChipsModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatGridListModule,
    MatDialogModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  declarations: [
      ColorPalletPickerComponent,
      DataTableComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      OverlayContainerComponent,
      PinnableCollectionComponent,
      ColorComponent,
      AdvancedOptionsComponent,
      AddExistingRoomComponent,
      RoomComponent,
      FolderComponent,
      NewRoomInFolderComponent,
      EditRoomInFolderComponent,
      BulkEditRoomsComponent,
      BulkEditRoomsInFolderComponent,
      ImportRoomsComponent,
  ],
  exports: [
      MatChipsModule,
      MatIconModule,
      MatTooltipModule,
      ColorPalletPickerComponent,
      DataTableComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      OverlayContainerComponent,
      PinnableCollectionComponent,
      ColorComponent,
      AddExistingRoomComponent,
      RoomComponent,
      FolderComponent,
      NewRoomInFolderComponent,
      EditRoomInFolderComponent,
      BulkEditRoomsComponent,
      BulkEditRoomsInFolderComponent,
      ImportRoomsComponent
  ],
  entryComponents: [
      OverlayContainerComponent,
  ],
})
export class AdminSharedModule { }
