import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BackButtonComponent} from '../back-button/back-button.component';
import {ColorPalletPickerComponent} from '../color-pallet-picker/color-pallet-picker.component';
import {DataTableComponent} from '../data-table/data-table.component';
import {DateInputComponent} from '../date-input/date-input.component';
import {IconPickerComponent} from '../icon-picker/icon-picker.component';
import {NavButtonComponent} from '../nav-button/nav-button.component';
import {OverlayContainerComponent} from '../overlay-container/overlay-container.component';
import {PinnableCollectionComponent} from '../pinnable-collection/pinnable-collection.component';
import {RoundInputComponent} from '../round-input/round-input.component';
import {SquareInputComponent} from '../square-input/square-input.component';
import {TogglePickerComponent} from '../toggle-picker/toggle-picker.component';
import {AppInputComponent} from '../../app-input/app-input.component';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    BackButtonComponent,
    ColorPalletPickerComponent,
    DataTableComponent,
    DateInputComponent,
    IconPickerComponent,
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
  ],
  exports: [
    BackButtonComponent,
    ColorPalletPickerComponent,
    DataTableComponent,
    DateInputComponent,
    IconPickerComponent,
    NavButtonComponent,
    OverlayContainerComponent,
    PinnableCollectionComponent,
    RoundInputComponent,
    SquareInputComponent,
    TogglePickerComponent,
    AppInputComponent,
  ],
})
export class SharedModule { }
