import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  MatDialogModule,
  MatTableModule,
  MatCheckboxModule,
  MatSortModule,
  MatGridListModule
} from '@angular/material';

import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminPageComponent } from './admin-page/admin-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NavComponent } from './nav/nav.component';
import { NavButtonComponent } from './nav-button/nav-button.component';
import { HallmonitorComponent } from './hallmonitor/hallmonitor.component';
import { SearchComponent } from './search/search.component';
import { AppInputComponent } from './../app-input/app-input.component';
import { PassConfigComponent } from './pass-config/pass-config.component';
import { DataTableComponent } from './data-table/data-table.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { SupportComponent } from './support/support.component';
import { PinnableCollectionComponent } from './pinnable-collection/pinnable-collection.component';
import { BackButtonComponent } from './back-button/back-button.component';
import { RoundInputComponent } from './round-input/round-input.component';
import { SquareInputComponent } from './square-input/square-input.component';
import { DateInputComponent } from './date-input/date-input.component';
import { ColorPalletPickerComponent } from './color-pallet-picker/color-pallet-picker.component';
import { IconPickerComponent } from './icon-picker/icon-picker.component';
import { OverlayContainerComponent } from './overlay-container/overlay-container.component';
import { TogglePickerComponent } from './toggle-picker/toggle-picker.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatGridListModule,
    MatDialogModule
  ],
  declarations: [
    AdminPageComponent,
    DashboardComponent,
    NavComponent,
    NavButtonComponent,
    HallmonitorComponent,
    SearchComponent,
    PassConfigComponent,
    AppInputComponent,
    DataTableComponent,
    FeedbackComponent,
    SupportComponent,
    PinnableCollectionComponent,
    OverlayContainerComponent,
    ColorPalletPickerComponent,
    PinnableCollectionComponent,
    BackButtonComponent,
    RoundInputComponent,
    SquareInputComponent,
    DateInputComponent,
    IconPickerComponent,

    TogglePickerComponent
  ],
  entryComponents: [
    AppInputComponent,
    OverlayContainerComponent,
    DateInputComponent
  ],
  providers: [
      //NavbarDataService
  ],
})
export class AdminModule {
}
