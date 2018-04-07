import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {MatButtonModule} from '@angular/material/button';
import {TeacherSearchComponent} from './teacher-search/teacher-search.component';
import {GoogleSigninComponent} from './google-signin/google-signin.component';
import {HallpassFormComponent} from './hallpass-form/hallpass-form.component';
import {MainPageComponent} from './main-page/main-page.component';
import {RouterModule, Routes} from '@angular/router';
import {DataService} from './data-service';
import {HttpService} from './http-service';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {StudentSearchComponent} from './student-search/student-search.component';
import {AccountComponent} from './account/account.component';
import {TagInputModule} from 'ngx-chips';
import {AngularDateTimePickerModule} from 'angular2-datetimepicker';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {GoogleApiModule, NG_GAPI_CONFIG} from 'ng-gapi';
import {UserService} from './user.service';
import {GAPI_CONFIG} from './config';
import {MatProgressSpinnerModule} from '@angular/material';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ToastModule} from 'ng2-toastr/ng2-toastr';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {CalendarModule} from 'primeng/calendar';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {GrowlModule} from 'primeng/growl';
import {DataViewModule} from 'primeng/dataview';
import {PanelModule} from 'primeng/panel';
import {DialogModule} from 'primeng/dialog';
import {CardModule} from 'primeng/card';
import {InputSwitchModule} from 'primeng/inputswitch';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {ListboxModule} from 'primeng/listbox';
import {MessageService} from 'primeng/components/common/messageservice';
import { DateTimeComponent } from './date-time/date-time.component';
import {DurationPickerComponent} from './duration-picker/duration-picker.component';
import {IssuedPassListComponent} from './issued-pass-list/issued-pass-list.component';
import {JSONSerializer} from './models';
import {QuickpassPickerComponent} from './quickpass-picker/quickpass-picker.component';
import { PassCardComponent } from './pass-card/pass-card.component';
import { PassInfoComponent } from './pass-info/pass-info.component';
import { ActivatePassComponent } from './activate-pass/activate-pass.component';
const appRoutes: Routes = [
  { path: '', component: GoogleSigninComponent },
  { path: 'main', component: MainPageComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    TeacherSearchComponent,
    GoogleSigninComponent,
    HallpassFormComponent,
    MainPageComponent,
    StudentSearchComponent,
    AccountComponent,
    DateTimeComponent,
    DurationPickerComponent,
    IssuedPassListComponent,
    QuickpassPickerComponent,
    PassCardComponent,
    PassInfoComponent,
    ActivatePassComponent,
  ],
  entryComponents: [],
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
  providers: [DataService, HttpService, UserService, MessageService, JSONSerializer],
  bootstrap: [AppComponent]
})
export class AppModule {

}
