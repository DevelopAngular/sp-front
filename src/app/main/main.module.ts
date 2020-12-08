﻿import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FavoriteFormComponent} from '../favorite-form/favorite-form.component';
import {MainHallPassFormComponent} from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import {InvitationCardComponent} from '../invitation-card/invitation-card.component';
import {LocationCellComponent} from '../location-cell/location-cell.component';
import {LocationTableComponent} from '../location-table/location-table.component';
import {MainPageComponent} from '../main-page/main-page.component';
import {ReportFormComponent} from '../report-form/report-form.component';
import {RequestCardComponent} from '../request-card/request-card.component';
import {SettingsComponent} from '../settings/settings.component';
import {SharedModule} from '../shared/shared.module';
import {MainRoutingModule} from './main-routing.module';
import {FromWhereComponent} from '../create-hallpass-forms/main-hallpass--form/locations-group-container/from-where/from-where.component';
import {ToWhereComponent} from '../create-hallpass-forms/main-hallpass--form/locations-group-container/to-where/to-where.component';
import {LocationsGroupContainerComponent} from '../create-hallpass-forms/main-hallpass--form/locations-group-container/locations-group-container.component';
import {ToCategoryComponent} from '../create-hallpass-forms/main-hallpass--form/locations-group-container/to-category/to-category.component';
import {RestrictedTargetComponent} from '../create-hallpass-forms/main-hallpass--form/locations-group-container/restricted-target/restricted-target.component';
import {RestrictedMessageComponent} from '../create-hallpass-forms/main-hallpass--form/locations-group-container/restricted-message/restricted-message.component';
import {GroupsContainerComponent} from '../create-hallpass-forms/main-hallpass--form/student-groups/groups-container/groups-container.component';
import {GroupsStep1Component} from '../create-hallpass-forms/main-hallpass--form/student-groups/groups-step1/groups-step1.component';
import {GroupsStep2Component} from '../create-hallpass-forms/main-hallpass--form/student-groups/groups-step2/groups-step2.component';
import {GroupsStep3Component} from '../create-hallpass-forms/main-hallpass--form/student-groups/groups-step3/groups-step3.component';
import {TeacherFooterComponent} from '../create-hallpass-forms/main-hallpass--form/locations-group-container/teacher-footer/teacher-footer.component';
import {DateTimeContainerComponent} from '../create-hallpass-forms/main-hallpass--form/date-time-container/date-time-container.component';
import {FormFactorContainerComponent} from '../create-hallpass-forms/main-hallpass--form/form-factor-container/form-factor-container.component';
import {StudentFooterComponent} from '../create-hallpass-forms/main-hallpass--form/locations-group-container/student-footer/student-footer.component';
import {CreateHallpassFormsComponent} from '../create-hallpass-forms/create-hallpass-forms.component';
import {NotificationFormComponent} from '../notification-form/notification-form.component';
import {WhoYouAreComponent} from '../create-hallpass-forms/main-hallpass--form/student-groups/who-you-are/who-you-are.component';
import {AnimatedHeaderDirective} from '../core/directives/animated-header.directive';
import {DateTimeComponent} from '../create-hallpass-forms/main-hallpass--form/date-time-container/date-time/date-time.component';
import {NavbarComponent} from '../navbar/navbar.component';
import {NavButtonComponent} from '../nav-button/nav-button.component';
import {TeacherPinComponent} from '../teacher-pin/teacher-pin.component';
import {AssistantRestrictionComponent} from '../assistant-restriction/assistant-restriction.component';
import {PinInputComponent} from '../teacher-pin/pin-input/pin-input.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MainRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    SettingsComponent,
    MainHallPassFormComponent,
    LocationTableComponent,
    FavoriteFormComponent,
    ReportFormComponent,
    RequestCardComponent,
    InvitationCardComponent,
    LocationCellComponent,
    MainPageComponent,
    FromWhereComponent,
    ToWhereComponent,
    ToCategoryComponent,
    RestrictedTargetComponent,
    RestrictedMessageComponent,
    TeacherFooterComponent,
    StudentFooterComponent,
    LocationsGroupContainerComponent,
    GroupsContainerComponent ,
    GroupsStep1Component,
    GroupsStep2Component,
    GroupsStep3Component,
    WhoYouAreComponent,
    DateTimeContainerComponent,
    FormFactorContainerComponent,
    CreateHallpassFormsComponent,
    NotificationFormComponent,
    AnimatedHeaderDirective,
    DateTimeComponent,
    NavbarComponent,
    NavButtonComponent,
    TeacherPinComponent,
    AssistantRestrictionComponent,
    PinInputComponent
  ],
  // entryComponents: [
  //   CreateHallpassFormsComponent,
  //   FavoriteFormComponent,
  //   ReportFormComponent,
  //   RequestCardComponent,
  //   InvitationCardComponent,
  //   NotificationFormComponent,
  //   SettingsComponent,
  //   TeacherPinComponent
  // ],
  providers: [
  ]
})
export class MainModule {
}
