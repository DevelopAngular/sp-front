import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
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
import { AccountsComponent } from './accounts/accounts.component';
import { AppInputComponent } from './../app-input/app-input.component';
import { PassConfigComponent } from './pass-config/pass-config.component';
import { DataTableComponent } from './data-table/data-table.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { SupportComponent } from './support/support.component';
import { PinnableCollectionComponent } from './pinnable-collection/pinnable-collection.component';
import { ColorPalletPickerComponent } from './color-pallet-picker/color-pallet-picker.component';
import { IconPickerComponent } from './icon-picker/icon-picker.component';
import { OverlayContainerComponent } from './overlay-container/overlay-container.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatGridListModule
  ],

    declarations: [
        AdminPageComponent,
        DashboardComponent,
        NavComponent,
        NavButtonComponent,
        HallmonitorComponent,
        SearchComponent,
        AccountsComponent,
        PassConfigComponent,
        AppInputComponent,
        OverlayContainerComponent,
        ColorPalletPickerComponent,
        PinnableCollectionComponent,
        DataTableComponent,

        FeedbackComponent,

        SupportComponent,

        IconPickerComponent
    ],
    entryComponents: [
        AppInputComponent,
        OverlayContainerComponent,
    ],

    providers: [
        //NavbarDataService
    ],
})
export class AdminModule {
}
