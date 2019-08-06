import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatProgressSpinnerModule, MatSliderModule, MatSlideToggleModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgmCoreModule } from '@agm/core';
import {RouterModule, Routes} from '@angular/router';
import { AppComponent } from './app.component';
import { GAPI_CONFIG } from './config';
import { ConsentMenuComponent } from './consent-menu/consent-menu.component';
import { CurrentUserResolver } from './current-user.resolver';
import { DataService } from './services/data-service';
import { provideErrorHandler } from './error-handler';
import { GoogleLoginService } from './services/google-login.service';
import { GoogleSigninComponent } from './google-signin/google-signin.component';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { IsStudentOrTeacherGuard } from './guards/is-student-or-teacher.guard';
import { NotSeenIntroGuard } from './guards/not-seen-intro.guard';
import { HallDateTimePickerComponent } from './hall-date-time-picker/hall-date-time-picker.component';
import { HttpService } from './services/http-service';
import { IntroComponent } from './intro/intro.component';
import { LoadingService } from './services/loading.service';
import { LoginComponent } from './login/login.component';
import { OptionsComponent } from './options/options.component';
import { ProgressInterceptor } from './progress-interceptor';
import { GoogleApiService, SP_GAPI_CONFIG } from './services/google-api.service';
import { GoogleAuthService } from './services/google-auth.service';
import { SharedModule } from './shared/shared.module';
import { SignOutComponent } from './sign-out/sign-out.component';
import { UserService } from './services/user.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ErrorToastComponent } from './error-toast/error-toast.component';
import { SchoolToggleBarComponent } from './school-toggle-bar/school-toggle-bar.component';
import { ItemListComponent } from './item-list/item-list.component';
import { ItemCellComponent } from './item-cell/item-cell.component';
import { NextReleaseComponent } from './next-release/next-release.component';
import { NotificationService } from './services/notification-service';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { environment } from '../environments/environment';
import { ToastConnectionComponent } from './toast-connection/toast-connection.component';
import { ResizeInfoDialogComponent } from './resize-info-dialog/resize-info-dialog.component';
import { SignedOutToastComponent } from './signed-out-toast/signed-out-toast.component';
import { SortMenuComponent } from './sort-menu/sort-menu.component';
import {APP_BASE_HREF} from '@angular/common';
import { ErrorComponent } from './error/error.component';
import { IntroRouteComponent } from './intro-route/intro-route.component';
import { IntroDialogComponent } from './intro-dialog/intro-dialog.component';
import {NotKioskModeGuard} from './not-kiosk-mode.guard';
import {KioskModeService} from './services/kiosk-mode.service';
import { SchoolSignUpComponent } from './school-sign-up/school-sign-up.component';
import { AccountsSetupComponent } from './accounts-setup/accounts-setup.component';
import { SpDialogBoxComponent } from './sp-dialog-box/sp-dialog-box.component';
import {OverlayContainer} from '@angular/cdk/overlay';
import {InitOverlay} from './consent-menu-overlay';

const appRoutes: Routes = [
  {path: 'main/intro', canActivate: [AuthenticatedGuard], component: IntroRouteComponent, data: { hideSchoolToggleBar: true}},
  {path: 'school_signup', component: SchoolSignUpComponent, data: {hubspot: true, authFree: true}, pathMatch: 'full'},
  {path: 'accounts_setup', component: AccountsSetupComponent, pathMatch: 'full'},
  {
    path: '',
    component: LoginComponent,
    data: { hideSchoolToggleBar: true}
  },
  {
    path: 'main',
    canActivate: [NotSeenIntroGuard, AuthenticatedGuard, IsStudentOrTeacherGuard],
    loadChildren: 'app/main/main.module#MainModule',
    resolve: {currentUser: CurrentUserResolver},
    data: {
      hubspot: true,
      authFree: false
    }
  },
  {
    path: 'admin',
    canActivate: [AuthenticatedGuard, NotKioskModeGuard, IsAdminGuard],
    loadChildren: 'app/admin/admin.module#AdminModule',
    resolve: {currentUser: CurrentUserResolver},
    data: {
      hideScroll: true,
      hubspot: true,
      authFree: false
    }
  },
  {
    path: 'sign-out',
    component: SignOutComponent,
  },
  {
    path: 'error',
    component: ErrorComponent,
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
    ErrorToastComponent,
    SchoolToggleBarComponent,
    ItemListComponent,
    ItemCellComponent,
    NextReleaseComponent,
    ToastConnectionComponent,
    ResizeInfoDialogComponent,
    SignedOutToastComponent,
    ErrorComponent,
    SortMenuComponent,
    IntroRouteComponent,
    IntroDialogComponent,
    SchoolSignUpComponent,
    AccountsSetupComponent
  ],
  entryComponents: [
    ConsentMenuComponent,
    OptionsComponent,
    HallDateTimePickerComponent,
    ErrorToastComponent,
    NextReleaseComponent,
    ToastConnectionComponent,
    ResizeInfoDialogComponent,
    SignedOutToastComponent,
    IntroDialogComponent,
    SortMenuComponent,

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
      appRoutes,
      {
        enableTracing: false,
        // scrollPositionRestoration: 'enabled'
      }
    ),
    AngularFireModule.initializeApp(environment.firebase, 'notifyhallpass'),
    AngularFireMessagingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB-PvmYU5y4GQXh1aummcUI__LNhCtI68o',
      libraries: ['places']
    })
  ],
  providers: [
    DataService,
    HttpService,
    UserService,
    KioskModeService,
    NotificationService,
    GoogleLoginService,
    LoadingService,
    CurrentUserResolver,
    GoogleApiService,
    GoogleAuthService,
    {provide: OverlayContainer, useFactory: InitOverlay},
    {provide: HTTP_INTERCEPTORS, useClass: ProgressInterceptor, multi: true},
    {provide: SP_GAPI_CONFIG, useValue: GAPI_CONFIG},
    {provide: APP_BASE_HREF, useValue: environment.production ? '/app' : '/'},
    provideErrorHandler()
  ],
  exports: [
    SpDialogBoxComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {}
}
