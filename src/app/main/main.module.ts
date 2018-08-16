import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule
} from '@angular/material';
import { MatChipsModule } from '@angular/material/chips';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CardButtonComponent } from '../card-button/card-button.component';
import { ContainerCardComponent } from '../container-card/container-card.component';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { DisplayCardComponent } from '../display-card/display-card.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { DurationPickerComponent } from '../duration-picker/duration-picker.component';
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
import { NavButtonComponent } from '../nav-button/nav-button.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { PagerComponent } from '../pager/pager.component';
import { PassCardTemplateComponent } from '../pass-card-template/pass-card-template.component';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { PassCellComponent } from '../pass-cell/pass-cell.component';
import { PassCollectionComponent } from '../pass-collection/pass-collection.component';
import { PassTileComponent } from '../pass-tile/pass-tile.component';
import { PassesComponent } from '../passes/passes.component';
import { PinnableComponent } from '../pinnable/pinnable.component';
import { ReportFormComponent } from '../report-form/report-form.component';
import { RequestAcceptComponent } from '../request-accept/request-accept.component';
import { RequestCardComponent } from '../request-card/request-card.component';
import { SettingsComponent } from '../settings/settings.component';
import { SharedModule } from '../shared/shared.module';
import { SignOutComponent } from '../sign-out/sign-out.component';
import { StudentPickerComponent } from '../student-picker/student-picker.component';
import { StudentSearchComponent } from '../student-search/student-search.component';
import { TeacherDropdownComponent } from '../teacher-dropdown/teacher-dropdown.component';
import { TravelViewComponent } from '../travel-view/travel-view.component';
import { TraveltypePickerComponent } from '../traveltype-picker/traveltype-picker.component';

import { MainRoutingModule } from './main-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MainRoutingModule,
    MatGridListModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    MatChipsModule,
    MatSliderModule,
    MatProgressBarModule,
    MatDialogModule,
  ],
  declarations: [
    HallMonitorComponent,
    MyRoomComponent,
    PassesComponent,
    SettingsComponent,
    SignOutComponent,
    PassCollectionComponent,
    DropdownComponent,
    PassTileComponent,
    PassCellComponent,
    HallpassFormComponent,
    DateTimePickerComponent,
    InfoEditorComponent,
    RequestAcceptComponent,
    DisplayCardComponent,
    InlineRequestCardComponent,
    InlinePassCardComponent,
    LocationTableComponent,
    FavoriteFormComponent,
    StudentSearchComponent,
    StudentPickerComponent,
    ReportFormComponent,
    PinnableComponent,
    DurationPickerComponent,
    PassCardComponent,
    RequestCardComponent,
    InvitationCardComponent,
    PassCardTemplateComponent,
    TravelViewComponent,
    CardButtonComponent,
    PagerComponent,
    TraveltypePickerComponent,
    LocationCellComponent,
    LocationPickerComponent,
    ContainerCardComponent,
    TeacherDropdownComponent,
    MainPageComponent,
    NavbarComponent,
    NavButtonComponent,
  ],
  entryComponents: [
    HallpassFormComponent,

    RequestAcceptComponent,
    InfoEditorComponent,
    FavoriteFormComponent,
    ReportFormComponent,

    PassCardComponent,
    RequestCardComponent,
    InvitationCardComponent,
    InfoEditorComponent,
    TeacherDropdownComponent,
  ],
})
export class MainModule {
}
