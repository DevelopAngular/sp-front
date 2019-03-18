﻿import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  MatProgressBarModule, MatGridListModule,
  MatDialogModule,
  MatIconModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatChipsModule, MatCardModule, MatCheckboxModule, MatTableModule, MatProgressSpinnerModule, MatDividerModule, MatTooltipModule,
  MatListModule,
} from '@angular/material';


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
import {PassCollectionComponent} from '../pass-collection/pass-collection.component';
import {PassTileComponent} from '../pass-tile/pass-tile.component';
import {PassCellComponent} from '../pass-cell/pass-cell.component';
import { RestrictionDummyComponent } from '../admin/restriction-dummy/restriction-dummy.component';
import {BackButtonComponent} from '../admin/back-button/back-button.component';
import {PassCardComponent} from '../pass-card/pass-card.component';
import {PassCardTemplateComponent} from '../pass-card-template/pass-card-template.component';
import {TravelViewComponent} from '../travel-view/travel-view.component';
import {DurationPickerComponent} from '../duration-picker/duration-picker.component';
import {CardButtonComponent} from '../card-button/card-button.component';
import {PagerComponent} from '../pager/pager.component';
import {RoundInputComponent} from '../admin/round-input/round-input.component';
import {DragulaModule} from 'ng2-dragula';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {AppInputComponent} from '../app-input/app-input.component';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {DateTimeComponent} from '../create-hallpass-forms/main-hallpass--form/date-time-container/date-time/date-time.component';
import {CalendarComponent} from '../admin/calendar/calendar.component';
import {RestrictionPickerComponent} from '../restriction-picker/restriction-picker.component';



@NgModule({
  imports: [
    CommonModule,
    MatProgressBarModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FormsModule,
    ReactiveFormsModule,
      MatTooltipModule,
      MatListModule,
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
      MatDividerModule,
      InputTextareaModule,
    NgProgressModule.forRoot(),
    DragulaModule.forRoot()
  ],
  declarations: [
    DropdownComponent,
    GradientButtonComponent,
    ResolveAssetPipe,
    SmartpassLogoComponent,
    NavbarComponent,
    NavButtonComponent,
    DisplayCardComponent,
    DateTimePickerComponent,
    DateTimeComponent,
    PinnableComponent,
      TraveltypePickerComponent,
      StudentSearchComponent,
      DisplayReportCellComponent,
      PassCollectionComponent,
      PassTileComponent,
      PassCellComponent,
      RestrictionDummyComponent,
      BackButtonComponent,
      PassCardComponent,
      PassCardTemplateComponent,
      TravelViewComponent,
      DurationPickerComponent,
      CardButtonComponent,
      PagerComponent,
      RoundInputComponent,
      AppInputComponent,
      CalendarComponent,
      RestrictionPickerComponent
  ],
    entryComponents: [
      PassCardComponent,
      DropdownComponent,
      CalendarComponent,
      CalendarComponent
    ],
  exports: [
    ReactiveFormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatCheckboxModule,
    DragulaModule,
    GradientButtonComponent,
    ResolveAssetPipe,
    SmartpassLogoComponent,
    NavbarComponent,
    DisplayCardComponent,
    DateTimePickerComponent,
    PinnableComponent,
    DropdownComponent,
    TraveltypePickerComponent,
    StudentSearchComponent,
    DisplayReportCellComponent,
    PassCollectionComponent,
    PassTileComponent,
    PassCellComponent,
    RestrictionDummyComponent,
    BackButtonComponent,
    PassCardTemplateComponent,
    TravelViewComponent,
    DurationPickerComponent,
    CardButtonComponent,
    PagerComponent,
    RoundInputComponent,
    AppInputComponent,
    PassCardComponent,
    InputTextareaModule,
    DateTimeComponent,
    CalendarComponent,
    RestrictionPickerComponent

  ],
})
export class SharedModule {
}
