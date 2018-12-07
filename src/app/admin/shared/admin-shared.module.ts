import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataTableComponent } from '../data-table/data-table.component';
import { DateInputComponent } from '../date-input/date-input.component';
import { NavComponent } from '../nav/nav.component';
import { NavButtonComponent } from '../nav-button/nav-button.component';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import { PinnableCollectionComponent } from '../pinnable-collection/pinnable-collection.component';
import { SharedModule } from '../../shared/shared.module';
import { RoundInputComponent } from '../round-input/round-input.component';
import { AppInputComponent } from '../../app-input/app-input.component';
import { FormsModule } from '@angular/forms';
import {
  MatCheckboxModule,
  MatDialogModule,
  MatGridListModule,
  MatSortModule,
  MatTableModule,
  MatListModule,
  MatDividerModule, MatChipsModule, MatIconModule
} from '@angular/material';
import { IconPickerComponent } from '../icon-picker/icon-picker.component';
import { ColorPalletPickerComponent } from '../color-pallet-picker/color-pallet-picker.component';
import { TogglePickerComponent } from '../toggle-picker/toggle-picker.component';
import {ToggleInputComponent} from '../toggle-input/toggle-input.component';
import {AccountsDialogComponent} from '../accounts-dialog/accounts-dialog.component';
import {ProfilesSearchComponent} from '../profiles-search/profiles-search.component';
import { InputHelperDialogComponent } from '../input-helper-dialog/input-helper-dialog.component';
import { LocationSearchComponent } from '../location-search/location-search.component';

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
  ],
  declarations: [
      ToggleInputComponent,
      ColorPalletPickerComponent,
      DataTableComponent,
      DateInputComponent,
      InputHelperDialogComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      OverlayContainerComponent,
      PinnableCollectionComponent,
      RoundInputComponent,
      TogglePickerComponent,
      AppInputComponent,
      ProfilesSearchComponent,
      LocationSearchComponent
  ],
  exports: [
      MatChipsModule,
      MatIconModule,
      ToggleInputComponent,
      ColorPalletPickerComponent,
      DataTableComponent,
      DateInputComponent,
      InputHelperDialogComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      OverlayContainerComponent,
      PinnableCollectionComponent,
      RoundInputComponent,
      TogglePickerComponent,
      AppInputComponent,
      ProfilesSearchComponent,
      LocationSearchComponent
  ],
  entryComponents: [
      AccountsDialogComponent,
      AppInputComponent,
      OverlayContainerComponent,
      DateInputComponent,
      InputHelperDialogComponent
  ]
})
export class AdminSharedModule { }
