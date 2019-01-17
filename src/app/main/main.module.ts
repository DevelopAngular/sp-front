import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatChipsModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule
} from '@angular/material';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ContainerCardComponent } from '../container-card/container-card.component';
import { FavoriteFormComponent } from '../favorite-form/favorite-form.component';
import { HallMonitorComponent } from '../hall-monitor/hall-monitor.component';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
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
import { StudentPickerComponent } from '../student-picker/student-picker.component';
import { MainRoutingModule } from './main-routing.module';
import { NavbarDataService } from './navbar-data.service';
import { DateTimeComponent } from '../hallpass-form/locations-group-container/date-time/date-time.component';
import { FromWhereComponent } from '../hallpass-form/locations-group-container/from-where/from-where.component';
import { ToWhereComponent } from '../hallpass-form/locations-group-container/to-where/to-where.component';
import { LocationsGroupContainerComponent } from '../hallpass-form/locations-group-container/locations-group-container.component';
import {ToCategoryComponent} from '../hallpass-form/locations-group-container/to-category/to-category.component';
import {RestrictedTargetComponent} from '../hallpass-form/locations-group-container/restricted-target/restricted-target.component';

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
    MatGridListModule
  ],
  declarations: [
    HallMonitorComponent,
    MyRoomComponent,
    PassesComponent,
    SettingsComponent,
    HallpassFormComponent,
    InfoEditorComponent,
    RequestAcceptComponent,
    InlineRequestCardComponent,
    InlinePassCardComponent,
    LocationTableComponent,
    FavoriteFormComponent,
    StudentPickerComponent,
    ReportFormComponent,
    RequestCardComponent,
    InvitationCardComponent,
    LocationCellComponent,
    LocationPickerComponent,
    ContainerCardComponent,
    MainPageComponent,
    DateTimeComponent,
    FromWhereComponent,
    ToWhereComponent,
    ToCategoryComponent,
    RestrictedTargetComponent,
    LocationsGroupContainerComponent
  ],
  entryComponents: [
    HallpassFormComponent,
    RequestAcceptComponent,
    InfoEditorComponent,
    FavoriteFormComponent,
    ReportFormComponent,
    RequestCardComponent,
    InvitationCardComponent,
    InfoEditorComponent,

  ],
  providers: [
    NavbarDataService
  ]
})
export class MainModule {
}
