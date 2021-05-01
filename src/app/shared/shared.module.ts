﻿import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {SmartpassLogoComponent} from '../smartpass-logo/smartpass-logo.component';
import {DisplayCardComponent} from '../display-card/display-card.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PinnableComponent} from '../pinnable/pinnable.component';
import {TraveltypePickerComponent} from '../traveltype-picker/traveltype-picker.component';
import {SPSearchComponent} from '../sp-search/sp-search.component';
import {PassCollectionComponent} from '../pass-collection/pass-collection.component';
import {PassTileComponent} from '../pass-tile/pass-tile.component';
import {PassCellComponent} from '../pass-cell/pass-cell.component';
import {RestrictionDummyComponent} from '../admin/restriction-dummy/restriction-dummy.component';
import {BackButtonComponent} from '../admin/back-button/back-button.component';
import {PassCardComponent} from '../pass-card/pass-card.component';
import {TravelViewComponent} from '../travel-view/travel-view.component';
import {DurationPickerComponent} from '../duration-picker/duration-picker.component';
import {CardButtonComponent} from '../card-button/card-button.component';
import {PagerComponent} from '../pager/pager.component';
import {RoundInputComponent} from '../admin/round-input/round-input.component';
import {DragulaModule} from 'ng2-dragula';
import {AppInputComponent} from '../app-input/app-input.component';
import {CalendarComponent} from '../admin/calendar/calendar.component';
import {SafariScrollDirective} from '../safari-scroll.directive';
import {ToggleInputComponent} from '../admin/toggle-input/toggle-input.component';
import {CalendarPickerComponent} from '../calendar-components/calendar-picker/calendar-picker.component';
import {TimePickerComponent} from '../calendar-components/time-picker/time-picker.component';
import {AdminCalendarToggleComponent} from '../calendar-components/admin-calendar-toggle/admin-calendar-toggle.component';
import {ToggleOptionsComponent} from '../calendar-components/admin-calendar-toggle/toggle-options/toggle-options.component';
import {SpChipsComponent} from '../sp-chips/sp-chips.component';
import {SWIPER_CONFIG, SwiperConfigInterface, SwiperModule} from 'ngx-swiper-wrapper';
import {IconButtonComponent} from '../icon-button/icon-button.component';
import {XsButtonComponent} from '../xs-button/xs-button.component';
import {GettingStartedProgressService} from '../admin/getting-started-progress.service';
import {CreatePassButtonComponent} from '../passes/create-pass-button/create-pass-button.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {IosCalendarWheelComponent} from '../ios-calendar/ios-calendar-wheel/ios-calendar-wheel.component';
import {IosCalendarComponent} from '../ios-calendar/ios-calendar.component';
import {NavbarElementSenderDirective} from '../core/directives/navbar-element-sender.directive';
import {ChartsModule} from 'ng2-charts';
import {ConsentMenuComponent} from '../consent-menu/consent-menu.component';
import {GoogleSigninComponent} from '../google-signin/google-signin.component';
import {IntroDialogComponent} from '../intro-dialog/intro-dialog.component';
import {IntroComponent} from '../intro/intro.component';
import {SortMenuComponent} from '../sort-menu/sort-menu.component';
import {CoreModule} from '../core/core.module';
import {PrivacyCardComponent} from '../admin/accounts/privacy-card/privacy-card.component';
import {ProfileComponent} from '../admin/accounts/account-groups/profile/profile.component';
import {AccountGroupsComponent} from '../admin/accounts/account-groups/account-groups.component';
import {TeacherPinStudentComponent} from '../teacher-pin-student/teacher-pin-student.component';
import {ReportSuccessToastComponent} from '../report-success-toast/report-success-toast.component';
import {RestrictionPickerComponent} from '../restriction-picker/restriction-picker.component';
import {SpAppearanceComponent} from '../sp-appearance/sp-appearance.component';
import {MyProfileDialogComponent} from '../my-profile-dialog/my-profile-dialog.component';
import {ProfileInfoComponent} from '../my-profile-dialog/profile-info/profile-info.component';
import {ChangePasswordComponent} from '../my-profile-dialog/change-password/change-password.component';
import {CustomToolTipComponent} from './shared-components/custom-tool-tip/custom-tool-tip.component';
import {PassLimitTooltipComponent} from './shared-components/pass-limit-tooltip/pass-limit-tooltip.component';
import {StudentPassesComponent} from '../student-passes/student-passes.component';
import {StudentPassesInfoCardComponent} from '../student-passes/student-passes-info-card/student-passes-info-card.component';
import {BigStudentPassCardComponent} from '../big-student-pass-card/big-student-pass-card.component';
import {StudentMetricsComponent} from '../big-student-pass-card/student-metrics/student-metrics.component';
import {InlinePassCardComponent} from '../inline-pass-card/inline-pass-card.component';
import {RequestCardComponent} from '../request-card/request-card.component';
import {InlineRequestCardComponent} from '../inline-request-card/inline-request-card.component';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};

@NgModule({
  imports: [
    CommonModule,
    ScrollingModule,
    FormsModule,
    ReactiveFormsModule,
    DragulaModule.forRoot(),
    SwiperModule,
    ChartsModule,
    CoreModule
  ],
  declarations: [
    GoogleSigninComponent,
    SmartpassLogoComponent,
    DisplayCardComponent,
    PinnableComponent,
    TraveltypePickerComponent,
    SPSearchComponent,
    PassCollectionComponent,
    PassTileComponent,
    PassCellComponent,
    RestrictionDummyComponent,
    BackButtonComponent,
    PassCardComponent,
    TravelViewComponent,
    DurationPickerComponent,
    CardButtonComponent,
    PagerComponent,
    RoundInputComponent,
    AppInputComponent,
    CalendarComponent,
    SafariScrollDirective,
    ToggleInputComponent,
    CalendarPickerComponent,
    TimePickerComponent,
    AdminCalendarToggleComponent,
    ToggleOptionsComponent,
    SpChipsComponent,
    IconButtonComponent,
    XsButtonComponent,
    CreatePassButtonComponent,
    IosCalendarWheelComponent,
    IosCalendarComponent,
    NavbarElementSenderDirective,
    ConsentMenuComponent,
    IntroDialogComponent,
    IntroComponent,
    SortMenuComponent,
    PrivacyCardComponent,
    ProfileComponent,
    AccountGroupsComponent,
    ReportSuccessToastComponent,
    RestrictionPickerComponent,
    SpAppearanceComponent,
    TeacherPinStudentComponent,
    MyProfileDialogComponent,
    ProfileInfoComponent,
    ChangePasswordComponent,
    CustomToolTipComponent,
    PassLimitTooltipComponent,
    StudentPassesComponent,
    StudentPassesInfoCardComponent,
    BigStudentPassCardComponent,
    StudentMetricsComponent,
    InlinePassCardComponent,
    RequestCardComponent,
    InlineRequestCardComponent
  ],
  exports: [
    ReactiveFormsModule,
    ScrollingModule,
    DragulaModule,
    SmartpassLogoComponent,
    DisplayCardComponent,
    PinnableComponent,
    TraveltypePickerComponent,
    SPSearchComponent,
    PassCollectionComponent,
    PassTileComponent,
    PassCellComponent,
    RestrictionDummyComponent,
    BackButtonComponent,
    TravelViewComponent,
    DurationPickerComponent,
    CardButtonComponent,
    PagerComponent,
    RoundInputComponent,
    AppInputComponent,
    PassCardComponent,
    CalendarComponent,
    SafariScrollDirective,
    ToggleInputComponent,
    CalendarPickerComponent,
    TimePickerComponent,
    AdminCalendarToggleComponent,
    ToggleOptionsComponent,
    SpChipsComponent,
    IconButtonComponent,
    XsButtonComponent,
    CreatePassButtonComponent,
    IosCalendarWheelComponent,
    IosCalendarComponent,
    ChartsModule,
    SmartpassLogoComponent,
    IntroComponent,
    GoogleSigninComponent,
    CoreModule,
    PrivacyCardComponent,
    ProfileComponent,
    AccountGroupsComponent,
    ReportSuccessToastComponent,
    RestrictionPickerComponent,
    ProfileInfoComponent,
    ChangePasswordComponent,
    TeacherPinStudentComponent,
    PassLimitTooltipComponent,
    StudentPassesComponent,
    StudentPassesInfoCardComponent,
    BigStudentPassCardComponent,
    StudentMetricsComponent,
    InlinePassCardComponent,
    RequestCardComponent,
    InlineRequestCardComponent
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
