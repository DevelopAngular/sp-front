import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { TeacherSearchComponent } from './teacher-search/teacher-search.component';
import { GoogleSigninComponent } from './google-signin/google-signin.component';
import { HallpassFormComponent } from './hallpass-form/hallpass-form.component';
import { MainPageComponent } from './main-page/main-page.component';
import { RouterModule, Routes } from '@angular/router';
import { DataService } from './data-service';
import { HttpService } from './http-service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { StudentSearchComponent } from './student-search/student-search.component';
import { TagInputModule } from 'ngx-chips';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { GoogleApiModule, NG_GAPI_CONFIG } from 'ng-gapi';
import { UserService } from './user.service';
import { GAPI_CONFIG } from './config';
import { MatProgressSpinnerModule } from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { GrowlModule } from 'primeng/growl';
import { DataViewModule } from 'primeng/dataview';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ListboxModule } from 'primeng/listbox';
import { MessageService } from 'primeng/components/common/messageservice';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SidebarModule } from 'primeng/sidebar';
import { DurationPickerComponent } from './duration-picker/duration-picker.component';
import { JSONSerializer } from './models';
import { ConsentMenuComponent } from './consent-menu/consent-menu.component';
import { PinnableComponent } from './pinnable/pinnable.component';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { LocationChooseComponent } from './location-choose/location-choose.component';
import { MatSliderModule } from '@angular/material/slider';
import { TypeSelectorComponent } from './type-selector/type-selector.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LocationTableComponent } from './location-table/location-table.component';
import { ResolveAssetPipe } from './resolve-asset.pipe';
import { LocationCellComponent } from './location-cell/location-cell.component';
import { HallpassCardComponent } from './hallpass-card/hallpass-card.component';
import { RequestCardComponent } from './request-card/request-card.component';
import { InvitationCardComponent } from './invitation-card/invitation-card.component';
import { FuturePassCardComponent } from './future-pass-card/future-pass-card.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GoogleLoginService } from './google-login.service';
import { GradientButtonComponent } from './gradient-button/gradient-button.component';

const appRoutes: Routes = [
  {path: '', redirectTo: '/main', pathMatch: 'full'},
  {path: 'main', component: MainPageComponent},
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
    TypeSelectorComponent,
    NavbarComponent,
    LocationTableComponent,
    ResolveAssetPipe,
    LocationCellComponent,
    HallpassCardComponent,
    RequestCardComponent,
    InvitationCardComponent,
    FuturePassCardComponent,
    GradientButtonComponent,
  ],
  entryComponents: [
    HallpassFormComponent,
    LocationChooseComponent,
    ConsentMenuComponent,
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
    ScrollPanelModule,
    InputSwitchModule,
    ListboxModule,
    ConfirmDialogModule,
    SidebarModule,
    MatCardModule,
    MatGridListModule,
    MatSliderModule,
    MatSlideToggleModule,
    ToastModule.forRoot(),
    RouterModule.forRoot(
      appRoutes
      // ,{ enableTracing: true } // <-- debugging purposes only
    ),
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: GAPI_CONFIG,
    })
  ],
  providers: [DataService,
    HttpService,
    UserService,
    MessageService,
    GoogleLoginService,
    JSONSerializer,
    ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
