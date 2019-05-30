import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataTableComponent } from '../data-table/data-table.component';
import { DateInputComponent } from '../date-input/date-input.component';
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
import { TogglePickerComponent } from '../toggle-picker/toggle-picker.component';
import { AccountsDialogComponent } from '../accounts-dialog/accounts-dialog.component';
import { ProfilesSearchComponent } from '../profiles-search/profiles-search.component';
import { InputHelperDialogComponent } from '../input-helper-dialog/input-helper-dialog.component';
import { LocationSearchComponent } from '../location-search/location-search.component';
import { ColorComponent } from '../color-pallet-picker/color/color.component';
import { AdvancedOptionsComponent } from '../overlay-container/advanced-options/advanced-options.component';
import {AddExistingRoomComponent} from '../overlay-container/add-existing-room/add-existing-room.component';

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
      DateInputComponent,
      InputHelperDialogComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      OverlayContainerComponent,
      PinnableCollectionComponent,
      TogglePickerComponent,
      ProfilesSearchComponent,
      LocationSearchComponent,
      ColorComponent,
      AdvancedOptionsComponent,
      AddExistingRoomComponent,

  ],
  exports: [
      MatChipsModule,
      MatIconModule,
      MatTooltipModule,
      ColorPalletPickerComponent,
      DataTableComponent,
      DateInputComponent,
      InputHelperDialogComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      OverlayContainerComponent,
      PinnableCollectionComponent,
      TogglePickerComponent,
      ProfilesSearchComponent,
      LocationSearchComponent,
      ColorComponent,
      AddExistingRoomComponent,
  ],
  entryComponents: [
      AccountsDialogComponent,
      OverlayContainerComponent,
      DateInputComponent,
      InputHelperDialogComponent
  ]
})
export class AdminSharedModule { }
