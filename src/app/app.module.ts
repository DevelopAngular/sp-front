import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule, MatStepperModule } from '@angular/material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
import { ConfirmationService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/components/common/messageservice';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { GrowlModule } from 'primeng/growl';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ListboxModule } from 'primeng/listbox';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SidebarModule } from 'primeng/sidebar';
import { AppComponent } from './app.component';
import { GAPI_CONFIG } from './config';
import { ConsentMenuComponent } from './consent-menu/consent-menu.component';
import { DataService } from './data-service';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker.component';
import { DurationPickerComponent } from './duration-picker/duration-picker.component';
import { GoogleLoginService } from './google-login.service';
import { GoogleSigninComponent } from './google-signin/google-signin.component';
import { GradientButtonComponent } from './gradient-button/gradient-button.component';
import { HallpassFormComponent } from './hallpass-form/hallpass-form.component';
import { HttpService } from './http-service';
import { LoadingService } from './loading.service';
import { LocationCellComponent } from './location-cell/location-cell.component';
import { LocationChooseComponent } from './location-choose/location-choose.component';
import { LocationPickerComponent } from './location-picker/location-picker.component';
import { LocationTableComponent } from './location-table/location-table.component';
import { MainPageComponent } from './main-page/main-page.component';
import { JSONSerializer } from './models';
import { NavbarComponent } from './navbar/navbar.component';
import { OptionsComponent } from './options/options.component';
import { PassCardComponent } from './pass-card/pass-card.component';
import { PinnableComponent } from './pinnable/pinnable.component';
import { RequestAcceptComponent } from './request-accept/request-accept.component';
import { ResolveAssetPipe } from './resolve-asset.pipe';
import { SignOutComponent } from './sign-out/sign-out.component';
import { StudentPickerComponent } from './student-picker/student-picker.component';
import { StudentSearchComponent } from './student-search/student-search.component';
import { TeacherSearchComponent } from './teacher-search/teacher-search.component';
import { UserService } from './user.service';
import { TraveltypePickerComponent } from './traveltype-picker/traveltype-picker.component';
import { PassTileComponent } from './pass-tile/pass-tile.component';
import { PassCellComponent } from './pass-cell/pass-cell.component';
import { ContainerCardComponent } from './container-card/container-card.component';
import { PassCollectionComponent } from './pass-collection/pass-collection.component';
import { DisplayCardComponent } from './display-card/display-card.component';
import { PagerComponent } from './pager/pager.component';

const appRoutes: Routes = [
  {path: '', redirectTo: '/main', pathMatch: 'full'},
  {path: 'main', component: MainPageComponent},
  {path: 'sign-out', component: SignOutComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    TeacherSearchComponent,
    GoogleSigninComponent,
    HallpassFormComponent,
    MainPageComponent,
    StudentSearchComponent,
    DurationPickerComponent,
    ConsentMenuComponent,
    PinnableComponent,
    LocationChooseComponent,
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
  ],
  entryComponents: [
    HallpassFormComponent,
    LocationChooseComponent,
    ConsentMenuComponent,
    OptionsComponent,
    RequestAcceptComponent
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
    AutoCompleteModule,
    CalendarModule,
    DropdownModule,
    ButtonModule,
    GrowlModule,
    DataViewModule,
    PanelModule,
    DialogModule,
    CardModule,
    MatProgressBarModule,
    ScrollPanelModule,
    InputSwitchModule,
    ListboxModule,
    ConfirmDialogModule,
    SidebarModule,
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
    MessageService,
    GoogleLoginService,
    JSONSerializer,
    ConfirmationService,
    LoadingService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
