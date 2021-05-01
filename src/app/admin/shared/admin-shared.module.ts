import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavComponent} from '../nav/nav.component';
import {NavButtonComponent} from '../nav-button/nav-button.component';
import {PinnableCollectionComponent} from '../pinnable-collection/pinnable-collection.component';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule} from '@angular/forms';
import {IconPickerComponent} from '../icon-picker/icon-picker.component';
import {ColorPalletPickerComponent} from '../color-pallet-picker/color-pallet-picker.component';
import {ColorComponent} from '../color-pallet-picker/color/color.component';
import {DisabledChipComponent} from '../accounts/disabled-chip/disabled-chip.component';
import {SpDataTableComponent} from '../sp-data-table/sp-data-table.component';
import {ColumnOptionsComponent} from '../sp-data-table/column-options/column-options.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule
  ],
  declarations: [
      ColorPalletPickerComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      PinnableCollectionComponent,
      ColorComponent,
      DisabledChipComponent,
      SpDataTableComponent,
      ColumnOptionsComponent,
  ],
  exports: [
      ColorPalletPickerComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      PinnableCollectionComponent,
      ColorComponent,
      SharedModule,
      DisabledChipComponent,
      SpDataTableComponent,
      ColumnOptionsComponent,
  ]
})
export class AdminSharedModule { }
