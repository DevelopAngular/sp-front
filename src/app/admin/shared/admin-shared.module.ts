import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackButtonComponent } from '../back-button/back-button.component';
import { DataTableComponent } from '../data-table/data-table.component';
import { DateInputComponent } from '../date-input/date-input.component';
import { NavComponent } from '../nav/nav.component';
import { NavButtonComponent } from '../nav-button/nav-button.component';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import { PinnableCollectionComponent } from '../pinnable-collection/pinnable-collection.component';
import { SharedModule } from '../../shared/shared.module';
import { RoundInputComponent } from '../round-input/round-input.component';
import { SquareInputComponent } from '../square-input/square-input.component';
import { AppInputComponent } from '../../app-input/app-input.component';
import { FormsModule } from '@angular/forms';
import {
    MatCheckboxModule,
    MatDialogModule,
    MatGridListModule,
    MatSortModule,
    MatTableModule,
    MatListModule,
    MatDividerModule
} from '@angular/material';
import { IconPickerComponent } from '../icon-picker/icon-picker.component';
import { ColorPalletPickerComponent } from '../color-pallet-picker/color-pallet-picker.component';
import { TogglePickerComponent } from '../toggle-picker/toggle-picker.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatGridListModule,
    MatDialogModule,
    MatListModule,
    MatDividerModule,
  ],
  declarations: [
      BackButtonComponent,
      ColorPalletPickerComponent,
      DataTableComponent,
      DateInputComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      OverlayContainerComponent,
      PinnableCollectionComponent,
      RoundInputComponent,
      SquareInputComponent,
      TogglePickerComponent,
      AppInputComponent,
  ],
  exports: [
      BackButtonComponent,
      ColorPalletPickerComponent,
      DataTableComponent,
      DateInputComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      OverlayContainerComponent,
      PinnableCollectionComponent,
      RoundInputComponent,
      SquareInputComponent,
      TogglePickerComponent,
      AppInputComponent,
  ],
  entryComponents: [
      AppInputComponent,
      OverlayContainerComponent,
      DateInputComponent
  ]
})
export class AdminSharedModule { }
