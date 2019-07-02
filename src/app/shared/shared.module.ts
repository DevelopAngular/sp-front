import { CommonModule } from '@angular/common';
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
import {SafariScrollDirective} from '../safari-scroll.directive';
import { ReportSuccessToastComponent } from '../report-success-toast/report-success-toast.component';
import {ToggleInputComponent} from '../admin/toggle-input/toggle-input.component';
import {CalendarPickerComponent} from '../calendar-components/calendar-picker/calendar-picker.component';
import {TimePickerComponent} from '../calendar-components/time-picker/time-picker.component';
import {AdminCalendarToggleComponent} from '../calendar-components/admin-calendar-toggle/admin-calendar-toggle.component';
import {ToggleOptionsComponent} from '../calendar-components/admin-calendar-toggle/toggle-options/toggle-options.component';
import {SpChipsComponent} from '../sp-chips/sp-chips.component';
import {SWIPER_CONFIG, SwiperConfigInterface, SwiperModule} from 'ngx-swiper-wrapper';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import {RoomsSearchComponent} from '../rooms-search/rooms-search.component';
import {XsButtonComponent} from '../xs-button/xs-button.component';
import {AccountGroupsComponent} from '../admin/accounts/account-groups/account-groups.component';
import {PrivacyCardComponent} from '../admin/accounts/privacy-card/privacy-card.component';
import {ProfileComponent} from '../admin/accounts/account-groups/profile/profile.component';
import {ConsentMenuMobileComponent} from '../consent-menu-mobile/consent-menu-mobile.component';
import {GettingStartedProgressService} from '../admin/getting-started-progress.service';
import {CreatePassButtonComponent} from '../passes/create-pass-button/create-pass-button.component';


const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};

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
    // NgProgressModule.forRoot(),
    NgProgressModule.withConfig({}),
    DragulaModule.forRoot(),
    SwiperModule,
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
      RestrictionPickerComponent,
      SafariScrollDirective,
      ReportSuccessToastComponent,
      ToggleInputComponent,
      CalendarPickerComponent,
      TimePickerComponent,
      AdminCalendarToggleComponent,
      ToggleOptionsComponent,
      SpChipsComponent,
      RoomsSearchComponent,
      IconButtonComponent,
      XsButtonComponent,
      AccountGroupsComponent,
      PrivacyCardComponent,
      ProfileComponent,
      ConsentMenuMobileComponent,
      CreatePassButtonComponent
  ],
    entryComponents: [
      PassCardComponent,
      DropdownComponent,
      CalendarComponent,
      CalendarComponent,
      ReportSuccessToastComponent,
    ],
  exports: [
    ReactiveFormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
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
    RestrictionPickerComponent,
    SafariScrollDirective,
    ReportSuccessToastComponent,
    ToggleInputComponent,
    CalendarPickerComponent,
    TimePickerComponent,
    AdminCalendarToggleComponent,
    ToggleOptionsComponent,
    SpChipsComponent,
    RoomsSearchComponent,
    IconButtonComponent,
    XsButtonComponent,
    AccountGroupsComponent,
    PrivacyCardComponent,
    ProfileComponent,
    ConsentMenuMobileComponent,
      CreatePassButtonComponent
  ],
  providers: [
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    },
    GettingStartedProgressService
  ]
})
export class SharedModule {
}
