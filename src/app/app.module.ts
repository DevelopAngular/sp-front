import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule, MatStepperModule } from '@angular/material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import { GoogleApiModule, NG_GAPI_CONFIG } from 'ng-gapi';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TagInputModule } from 'ngx-chips';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AppComponent } from './app.component';
import { CardButtonComponent } from './card-button/card-button.component';
import { GAPI_CONFIG } from './config';
import { ConsentMenuComponent } from './consent-menu/consent-menu.component';
import { ContainerCardComponent } from './container-card/container-card.component';
import { DataService } from './data-service';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker.component';
import { DisplayCardComponent } from './display-card/display-card.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { DurationPickerComponent } from './duration-picker/duration-picker.component';
import { FavoriteFormComponent } from './favorite-form/favorite-form.component';
import { GoogleLoginService } from './google-login.service';
import { GoogleSigninComponent } from './google-signin/google-signin.component';
import { GradientButtonComponent } from './gradient-button/gradient-button.component';
import { HallMonitorComponent } from './hall-monitor/hall-monitor.component';
import { HallpassFormComponent } from './hallpass-form/hallpass-form.component';
import { HttpService } from './http-service';
import { InfoEditorComponent } from './info-editor/info-editor.component';
import { InlinePassCardComponent } from './inline-pass-card/inline-pass-card.component';
import { InlineRequestCardComponent } from './inline-request-card/inline-request-card.component';
import { IntroComponent } from './intro/intro.component';
import { InvitationCardComponent } from './invitation-card/invitation-card.component';
import { LoadingService } from './loading.service';
import { LocationCellComponent } from './location-cell/location-cell.component';
import { LocationPickerComponent } from './location-picker/location-picker.component';
import { LocationTableComponent } from './location-table/location-table.component';
import { MainPageComponent } from './main-page/main-page.component';
import { MyRoomComponent } from './my-room/my-room.component';
import { NavButtonComponent } from './nav-button/nav-button.component';
import { NavbarComponent } from './navbar/navbar.component';
import { OptionsComponent } from './options/options.component';
import { PagerComponent } from './pager/pager.component';
import { PassCardTemplateComponent } from './pass-card-template/pass-card-template.component';
import { PassCardComponent } from './pass-card/pass-card.component';
import { PassCellComponent } from './pass-cell/pass-cell.component';
import { PassCollectionComponent } from './pass-collection/pass-collection.component';
import { PassTileComponent } from './pass-tile/pass-tile.component';
import { PassesComponent } from './passes/passes.component';
import { PinnableComponent } from './pinnable/pinnable.component';
import { ReportFormComponent } from './report-form/report-form.component';
import { RequestAcceptComponent } from './request-accept/request-accept.component';
import { RequestCardComponent } from './request-card/request-card.component';
import { ResolveAssetPipe } from './resolve-asset.pipe';
import { SettingsComponent } from './settings/settings.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { StudentPickerComponent } from './student-picker/student-picker.component';
import { StudentSearchComponent } from './student-search/student-search.component';
import { TeacherDropdownComponent } from './teacher-dropdown/teacher-dropdown.component';
import { TravelViewComponent } from './travel-view/travel-view.component';
import { TraveltypePickerComponent } from './traveltype-picker/traveltype-picker.component';
import { UserService } from './user.service';

const appRoutes: Routes = [
  {path: '', redirectTo: '/passes', pathMatch: 'full'},
  {path: 'passes', component: PassesComponent},
  {path: 'hallmonitor', component: HallMonitorComponent},
  {path: 'myroom', component: MyRoomComponent},
  {path: 'sign-out', component: SignOutComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'intro', component: IntroComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    GoogleSigninComponent,
    HallpassFormComponent,
    MainPageComponent,
    StudentSearchComponent,
    DurationPickerComponent,
    ConsentMenuComponent,
    PinnableComponent,
    NavbarComponent,
    LocationTableComponent,
    ResolveAssetPipe,
    LocationCellComponent,
    GradientButtonComponent,
    SignOutComponent,
    OptionsComponent,
    RequestAcceptComponent,
    StudentPickerComponent,
    LocationPickerComponent,
    DateTimePickerComponent,
    PassCardComponent,
    TraveltypePickerComponent,
    PassTileComponent,
    PassCellComponent,
    ContainerCardComponent,
    PassCollectionComponent,
    DisplayCardComponent,
    PagerComponent,
    PassCardTemplateComponent,
    TravelViewComponent,
    CardButtonComponent,
    RequestCardComponent,
    InvitationCardComponent,
    InlinePassCardComponent,
    InlineRequestCardComponent,
    InfoEditorComponent,
    NavButtonComponent,
    HallMonitorComponent,
    MyRoomComponent,
    PassesComponent,
    ReportFormComponent,
    DropdownComponent,
    TeacherDropdownComponent,
    SettingsComponent,
    IntroComponent,
    FavoriteFormComponent,
  ],
  entryComponents: [
    HallpassFormComponent,
    ConsentMenuComponent,
    OptionsComponent,
    RequestAcceptComponent,
    PassCardComponent,
    RequestCardComponent,
    InvitationCardComponent,
    InfoEditorComponent,
    ReportFormComponent,
    TeacherDropdownComponent,
    FavoriteFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    InfiniteScrollModule,
    TagInputModule,
    AngularDateTimePickerModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatCardModule,
    NgxMatSelectSearchModule,
    MatStepperModule,
    MatRadioModule,
    MatGridListModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AmazingTimePickerModule,
    MatChipsModule,
    RouterModule.forRoot(
      appRoutes
    ),
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: GAPI_CONFIG,
    })
  ],
  providers: [
    DataService,
    HttpService,
    UserService,
    GoogleLoginService,
    LoadingService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
