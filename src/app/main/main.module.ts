import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatChipsModule,
  MatDialogModule,
  MatDividerModule,
  MatGridListModule,
  MatListModule,
  MatIconModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSidenavModule
} from '@angular/material';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FavoriteFormComponent } from '../favorite-form/favorite-form.component';
import { HallMonitorComponent } from '../hall-monitor/hall-monitor.component';
import { MainHallPassFormComponent } from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import { InfoEditorComponent } from '../info-editor/info-editor.component';
import { InlinePassCardComponent } from '../inline-pass-card/inline-pass-card.component';
import { InlineRequestCardComponent } from '../inline-request-card/inline-request-card.component';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';
import { LocationCellComponent } from '../location-cell/location-cell.component';
import { LocationPickerComponent } from '../location-picker/location-picker.component';
import { LocationTableComponent } from '../location-table/location-table.component';
import { MainPageComponent } from '../main-page/main-page.component';
import { MyRoomComponent } from '../my-room/my-room.component';
import { PassesComponent } from '../passes/passes.component';
import { ReportFormComponent } from '../report-form/report-form.component';
import { RequestAcceptComponent } from '../request-accept/request-accept.component';
import { RequestCardComponent } from '../request-card/request-card.component';
import { SettingsComponent } from '../settings/settings.component';
import { SharedModule } from '../shared/shared.module';
import { MainRoutingModule } from './main-routing.module';
import { NavbarDataService } from './navbar-data.service';
import { FromWhereComponent } from '../create-hallpass-forms/main-hallpass--form/locations-group-container/from-where/from-where.component';
import { ToWhereComponent } from '../create-hallpass-forms/main-hallpass--form/locations-group-container/to-where/to-where.component';
import { LocationsGroupContainerComponent } from '../create-hallpass-forms/main-hallpass--form/locations-group-container/locations-group-container.component';
import { ToCategoryComponent } from '../create-hallpass-forms/main-hallpass--form/locations-group-container/to-category/to-category.component';
import { RestrictedTargetComponent } from '../create-hallpass-forms/main-hallpass--form/locations-group-container/restricted-target/restricted-target.component';
import { RestrictedMessageComponent } from '../create-hallpass-forms/main-hallpass--form/locations-group-container/restricted-message/restricted-message.component';
import {GroupsContainerComponent} from '../create-hallpass-forms/main-hallpass--form/student-groups/groups-container/groups-container.component';
import {GroupsStep1Component} from '../create-hallpass-forms/main-hallpass--form/student-groups/groups-step1/groups-step1.component';
import {GroupsStep2Component} from '../create-hallpass-forms/main-hallpass--form/student-groups/groups-step2/groups-step2.component';
import {GroupsStep3Component} from '../create-hallpass-forms/main-hallpass--form/student-groups/groups-step3/groups-step3.component';
import { TeacherFooterComponent } from '../create-hallpass-forms/main-hallpass--form/locations-group-container/teacher-footer/teacher-footer.component';
import { DateTimeContainerComponent } from '../create-hallpass-forms/main-hallpass--form/date-time-container/date-time-container.component';
import { FormFactorContainerComponent } from '../create-hallpass-forms/main-hallpass--form/form-factor-container/form-factor-container.component';
import {StudentFooterComponent} from '../create-hallpass-forms/main-hallpass--form/locations-group-container/student-footer/student-footer.component';
import {CreateHallpassFormsComponent} from '../create-hallpass-forms/create-hallpass-forms.component';
import {NotificationFormComponent} from '../notification-form/notification-form.component';
import {WhoYouAreComponent} from '../create-hallpass-forms/main-hallpass--form/student-groups/who-you-are/who-you-are.component';
import {ScreenService} from '../services/screen.service';
import {KioskModeComponent} from '../kiosk-mode/kiosk-mode.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MainRoutingModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatChipsModule,
    MatSliderModule,
    MatProgressBarModule,
    MatDialogModule,
    MatGridListModule,
    MatDividerModule,
    MatGridListModule,
    MatListModule,
    MatSidenavModule
  ],
  declarations: [
    HallMonitorComponent,
    MyRoomComponent,
    PassesComponent,
    SettingsComponent,
    MainHallPassFormComponent,
    InfoEditorComponent,
    RequestAcceptComponent,
    InlineRequestCardComponent,
    InlinePassCardComponent,
    LocationTableComponent,
    FavoriteFormComponent,
    ReportFormComponent,
    RequestCardComponent,
    InvitationCardComponent,
    LocationCellComponent,
    LocationPickerComponent,
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
    KioskModeComponent,
  ],
  entryComponents: [
    CreateHallpassFormsComponent,
    RequestAcceptComponent,
    InfoEditorComponent,
    FavoriteFormComponent,
    ReportFormComponent,
    RequestCardComponent,
    InvitationCardComponent,
    InfoEditorComponent,
    NotificationFormComponent,
    SettingsComponent

  ],
  providers: [
    NavbarDataService,
    ScreenService
  ]
})
export class MainModule {
}
