import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
//import { MatProgressBarModule, MatGridListModule } from '@angular/material';
import {
  MatProgressBarModule, MatGridListModule,
  MatDialogModule,
  MatIconModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatChipsModule, MatCardModule, MatCheckboxModule, MatTab, MatTableModule, MatProgressSpinnerModule,
} from '@angular/material';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { GradientButtonComponent } from '../gradient-button/gradient-button.component';
import { NavButtonComponent } from '../nav-button/nav-button.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ResolveAssetPipe } from '../resolve-asset.pipe';
import { SmartpassLogoComponent } from '../smartpass-logo/smartpass-logo.component';
import { DisplayCardComponent } from '../display-card/display-card.component';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgProgressModule } from '@ngx-progressbar/core';
import { PinnableComponent } from '../pinnable/pinnable.component';
import { TraveltypePickerComponent } from '../traveltype-picker/traveltype-picker.component';
import { StudentSearchComponent } from '../student-search/student-search.component';
import { DisplayReportCellComponent } from '../display-report-cell/display-report-cell.component';
import {BackButtonComponent} from '../admin/back-button/back-button.component';
import {SearchComponent} from '../admin/search/search.component';
import {RoundInputComponent} from '../admin/round-input/round-input.component';
import {DataTableComponent} from '../admin/data-table/data-table.component';


@NgModule({
  imports: [
    CommonModule,
    MatProgressBarModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FormsModule,
    ReactiveFormsModule,
      MatCheckboxModule,
      MatTableModule,
      MatProgressSpinnerModule,
      MatGridListModule,
      MatDialogModule,
      MatIconModule,
      MatSelectModule,
      MatSliderModule,
      MatSlideToggleModule,
      MatChipsModule,
      MatCardModule,
    NgProgressModule.forRoot()
  ],
  declarations: [
    DataTableComponent,
    BackButtonComponent,
    RoundInputComponent,
    SearchComponent,
    GradientButtonComponent,
    ResolveAssetPipe,
    SmartpassLogoComponent,
    NavbarComponent,
    NavButtonComponent,
    DisplayCardComponent,
    DateTimePickerComponent,
    PinnableComponent,
      TraveltypePickerComponent,
      StudentSearchComponent,
      DisplayReportCellComponent,
  ],
  exports: [
    DataTableComponent,
    ReactiveFormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatCheckboxModule,
    BackButtonComponent,
    RoundInputComponent,
    SearchComponent,
    GradientButtonComponent,
    ResolveAssetPipe,
    SmartpassLogoComponent,
    NavbarComponent,
    DisplayCardComponent,
    DateTimePickerComponent,
    PinnableComponent,
      TraveltypePickerComponent,
      StudentSearchComponent,
      DisplayReportCellComponent,
  ],
})
export class SharedModule {
}
