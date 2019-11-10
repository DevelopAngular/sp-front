import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../data-table/data-table.component';
import { NavComponent } from '../nav/nav.component';
import { NavButtonComponent } from '../nav-button/nav-button.component';
import { PinnableCollectionComponent } from '../pinnable-collection/pinnable-collection.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { IconPickerComponent } from '../icon-picker/icon-picker.component';
import { ColorPalletPickerComponent } from '../color-pallet-picker/color-pallet-picker.component';
import { ColorComponent } from '../color-pallet-picker/color/color.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
  ],
  declarations: [
      ColorPalletPickerComponent,
      DataTableComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      PinnableCollectionComponent,
      ColorComponent,
  ],
  exports: [
      ColorPalletPickerComponent,
      DataTableComponent,
      IconPickerComponent,
      NavComponent,
      NavButtonComponent,
      PinnableCollectionComponent,
      ColorComponent,
      SharedModule
  ]
})
export class AdminSharedModule { }
