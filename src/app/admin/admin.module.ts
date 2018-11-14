import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';

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
import { TraveltypePickerComponent } from '../traveltype-picker/traveltype-picker.component';
import { ColorPalletPickerComponent } from './color-pallet-picker/color-pallet-picker.component';
import { IconPickerComponent } from './icon-picker/icon-picker.component';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        AdminRoutingModule,
        FormsModule,
        MatTableModule,
        MatCheckboxModule,
        MatSortModule,

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
        TraveltypePickerComponent,
        ColorPalletPickerComponent,

        DataTableComponent,

        FeedbackComponent,

        SupportComponent,

        IconPickerComponent
    ],
    entryComponents: [
        AppInputComponent,
    ],

    providers: [
        //NavbarDataService
    ],
})
export class AdminModule {
}
