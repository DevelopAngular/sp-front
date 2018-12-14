﻿import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatProgressSpinnerModule, MatSliderModule, MatSlideToggleModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { GoogleApiModule, NG_GAPI_CONFIG } from 'ng-gapi';
import { AppComponent } from './app.component';
import { GAPI_CONFIG } from './config';
import { ConsentMenuComponent } from './consent-menu/consent-menu.component';
import { CurrentUserResolver } from './currentUser.resolver';
import { DataService } from './data-service';
import { GoogleLoginService } from './google-login.service';
import { GoogleSigninComponent } from './google-signin/google-signin.component';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { IsStudentOrTeacherGuard } from './guards/is-student-or-teacher.guard';
import { HallDateTimePickerComponent } from './hall-date-time-picker/hall-date-time-picker.component';
import { HttpService } from './http-service';
import { IntroComponent } from './intro/intro.component';
import { LoadingService } from './loading.service';
import { LoginComponent } from './login/login.component';
import { OptionsComponent } from './options/options.component';
import { PdfComponent } from './pdf/pdf.component';
import { ProgressInterceptor } from './progress-interceptor';
import { SharedModule } from './shared/shared.module';
import { SignOutComponent } from './sign-out/sign-out.component';
import { UserService } from './user.service';

const appRoutes: Routes = [
  {path: '', redirectTo: 'main/passes', pathMatch: 'full'},
  {path: 'main/intro', component: IntroComponent},
  {
    path: 'main',
    canActivate: [AuthenticatedGuard, IsStudentOrTeacherGuard],
    loadChildren: 'app/main/main.module#MainModule'
  },
  {
    path: 'admin',
    canActivate: [AuthenticatedGuard, IsAdminGuard],
    loadChildren: 'app/admin/admin.module#AdminModule',
    data: {hideScroll: true}
  },
  {path: 'sign-out', component: SignOutComponent},
  {
    // path: 'pdf/:source',
    path: 'pdf/report',
    canActivate: [AuthenticatedGuard],
    component: PdfComponent,
    data: {hideScroll: true}
  },
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
    PdfComponent
  ],
  entryComponents: [
    ConsentMenuComponent,
    OptionsComponent,
    HallDateTimePickerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    ReactiveFormsModule,

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
      appRoutes, {enableTracing: true}
    ),
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: GAPI_CONFIG,
    }),
  ],
  providers: [
    DataService,
    HttpService,
    UserService,
    GoogleLoginService,
    LoadingService,
    CurrentUserResolver,
    {provide: HTTP_INTERCEPTORS, useClass: ProgressInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
