import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from '../back-button/back-button.component';
import { ColorPalletPickerComponent} from '../color-pallet-picker/color-pallet-picker.component';
import { DataTableComponent } from '../data-table/data-table.component';
import { DateInputComponent } from '../date-input/date-input.component';
import { IconPickerComponent } from '../icon-picker/icon-picker.component';
import { NavComponent } from '../nav/nav.component';
import { NavButtonComponent } from '../nav-button/nav-button.component';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import { PinnableCollectionComponent } from '../pinnable-collection/pinnable-collection.component';
import { SharedModule } from '../../shared/shared.module';
import { RoundInputComponent } from '../round-input/round-input.component';
import { SquareInputComponent } from '../square-input/square-input.component';
import {  TogglePickerComponent } from '../toggle-picker/toggle-picker.component';
import {AppInputComponent} from '../../app-input/app-input.component';
import {FormsModule} from '@angular/forms';
import {
  MatCheckboxModule, MatChipsModule, MatDialogModule, MatGridListModule, MatIconModule, MatSortModule,
  MatTableModule
} from '@angular/material';
import {ToggleInputComponent} from '../toggle-input/toggle-input.component';

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
    MatChipsModule,
    MatIconModule,
  ],
  declarations: [
      ToggleInputComponent,
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
      ToggleInputComponent,
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
      MatChipsModule,
      MatIconModule,
  ],
  entryComponents: [
      AppInputComponent,
      OverlayContainerComponent,
      DateInputComponent
  ]
})
export class AdminSharedModule { }
