import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatDialogModule, MatListModule, MatProgressSpinnerModule, MatSliderModule, MatSlideToggleModule} from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { GAPI_CONFIG } from './config';
import { ConsentMenuComponent } from './consent-menu/consent-menu.component';
import { CurrentUserResolver } from './current-user.resolver';
import { DataService } from './data-service';
import { provideErrorHandler } from './error-handler';
import { GoogleLoginService } from './google-login.service';
import { GoogleSigninComponent } from './google-signin/google-signin.component';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { IsStudentOrTeacherGuard } from './guards/is-student-or-teacher.guard';
import { NotSeenIntroGuard } from './guards/not-seen-intro.guard';
import { HallDateTimePickerComponent } from './hall-date-time-picker/hall-date-time-picker.component';
import { HttpService } from './http-service';
import { IntroComponent } from './intro/intro.component';
import { LoadingService } from './loading.service';
import { LoginComponent } from './login/login.component';
import { OptionsComponent } from './options/options.component';
import { PdfComponent } from './pdf/pdf.component';
import { ProgressInterceptor } from './progress-interceptor';
import { GoogleApiService, SP_GAPI_CONFIG } from './services/google-api.service';
import { GoogleAuthService } from './services/google-auth.service';
import { SharedModule } from './shared/shared.module';
import { SignOutComponent } from './sign-out/sign-out.component';
import { UserService } from './user.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SelectProfileComponent } from './select-profile/select-profile.component';
import { ErrorToastComponent } from './error-toast/error-toast.component';
import { SchoolToggleBarComponent } from './school-toggle-bar/school-toggle-bar.component';;
import { ItemListComponent } from './item-list/item-list.component';
import { ItemCellComponent } from './item-cell/item-cell.component'

const appRoutes: Routes = [
  {path: 'main/intro', canActivate: [AuthenticatedGuard], component: IntroComponent},
  {path: '', redirectTo: 'select-profile', pathMatch: 'full'},
  {
    path: '',
    canActivate: [NotSeenIntroGuard],
    children: [
      {
        path: 'main',
        canActivate: [AuthenticatedGuard, IsStudentOrTeacherGuard],
        loadChildren: 'app/main/main.module#MainModule'
      },
      {
        path: 'select-profile',
        component: SelectProfileComponent,
        resolve: {
          currentUser: CurrentUserResolver
        }
      },
      {
        path: 'admin',
        canActivate: [AuthenticatedGuard, IsAdminGuard],
        loadChildren: 'app/admin/admin.module#AdminModule',
        data: {
          hideScroll: true
        }
      },
      {
        path: 'sign-out',
        component: SignOutComponent,
      },
      {
        // path: 'pdf/:source',
        path: 'pdf/report',
        canActivate: [AuthenticatedGuard],
        component: PdfComponent,
        data: {
          hideScroll: true
        }
      },
    ]
  },
  {path: '**', redirectTo: 'main/passes', pathMatch: 'full'},
];


@NgModule({
  declarations: [
    AppComponent,
    GoogleSigninComponent,
    SignOutComponent,
    ConsentMenuComponent,
    OptionsComponent,
    IntroComponent,
    LoginComponent,
    HallDateTimePickerComponent,
    PdfComponent,
    SelectProfileComponent,
    ErrorToastComponent,
    SchoolToggleBarComponent,
    ItemListComponent
,
    ItemCellComponent  ],
  entryComponents: [
    ConsentMenuComponent,
    OptionsComponent,
    HallDateTimePickerComponent,
    ErrorToastComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    MatSliderModule,
    FormsModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatSlideToggleModule,

    RouterModule.forRoot(
      appRoutes, {enableTracing: false}
    ),
  ],
  providers: [
    DataService,
    HttpService,
    UserService,
    GoogleLoginService,
    LoadingService,
    CurrentUserResolver,
    GoogleApiService,
    GoogleAuthService,
    {provide: HTTP_INTERCEPTORS, useClass: ProgressInterceptor, multi: true},
    {provide: SP_GAPI_CONFIG, useValue: GAPI_CONFIG},
    provideErrorHandler()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
