import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatIconModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatChipsModule,
  MatGridListModule
} from '@angular/material';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CardButtonComponent } from '../card-button/card-button.component';
import { ContainerCardComponent } from '../container-card/container-card.component';
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
import { PagerComponent } from '../pager/pager.component';
import { PassCardTemplateComponent } from '../pass-card-template/pass-card-template.component';
// import { PassCardComponent } from '../pass-card/pass-card.component';
import { PassCellComponent } from '../pass-cell/pass-cell.component';
// import { PassCollectionComponent } from '../pass-collection/pass-collection.component';
import { PassTileComponent } from '../pass-tile/pass-tile.component';
import { PassesComponent } from '../passes/passes.component';
import { ReportFormComponent } from '../report-form/report-form.component';
import { RequestAcceptComponent } from '../request-accept/request-accept.component';
import { RequestCardComponent } from '../request-card/request-card.component';
import { SettingsComponent } from '../settings/settings.component';
import { SharedModule } from '../shared/shared.module';
import { SignOutComponent } from '../sign-out/sign-out.component';
import { StudentPickerComponent } from '../student-picker/student-picker.component';
//import { StudentSearchComponent } from '../student-search/student-search.component';
import { TeacherDropdownComponent } from '../teacher-dropdown/teacher-dropdown.component';
import { TravelViewComponent } from '../travel-view/travel-view.component';
import { MainRoutingModule } from './main-routing.module';
import { NavbarDataService } from './navbar-data.service';
import { DateInputComponent } from '../admin/date-input/date-input.component';

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
    SignOutComponent,
    DropdownComponent,
    // PassTileComponent,
    // PassCellComponent,
    HallpassFormComponent,
    InfoEditorComponent,
    RequestAcceptComponent,
    InlineRequestCardComponent,
    InlinePassCardComponent,
    LocationTableComponent,
    FavoriteFormComponent,
    //StudentSearchComponent,
    StudentPickerComponent,
    ReportFormComponent,
    // PassCardComponent,
    RequestCardComponent,
    InvitationCardComponent,
    LocationCellComponent,
    LocationPickerComponent,
    ContainerCardComponent,
    TeacherDropdownComponent,
    MainPageComponent
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
    TeacherDropdownComponent
  ],
  providers: [
    NavbarDataService
  ]
})
export class MainModule {
}
