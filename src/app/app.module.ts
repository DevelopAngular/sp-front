import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule, MatProgressSpinnerModule, MatSliderModule, MatSlideToggleModule} from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { GoogleApiModule, NG_GAPI_CONFIG } from 'ng-gapi';
import { AppComponent } from './app.component';
import { AuthenticatedGuard } from './authenticated.guard';
import { GAPI_CONFIG } from './config';
import { ConsentMenuComponent } from './consent-menu/consent-menu.component';
import { DataService } from './data-service';
import { GoogleLoginService } from './google-login.service';
import { GoogleSigninComponent } from './google-signin/google-signin.component';
import { HttpService } from './http-service';
import { IntroComponent } from './intro/intro.component';
import { LoadingService } from './loading.service';
import { OptionsComponent } from './options/options.component';
import { SharedModule } from './shared/shared.module';
import { AdminModule } from './admin/admin.module';
import { UserService } from './user.service';
import { LoginComponent } from './login/login.component';
import { ProgressInterceptor } from './progress-interceptor';
import { HallDateTimePickerComponent } from './hall-date-time-picker/hall-date-time-picker.component';;
import { PdfComponent } from './pdf/pdf.component'
import {CurrentUserResolver} from './currentUser.resolver';

const appRoutes: Routes = [
  {path: '', redirectTo: 'main/passes', pathMatch: 'full'},
  {path: 'main/intro', component: IntroComponent},
  {
    path: 'main',
    canActivate: [AuthenticatedGuard],
    loadChildren: 'app/main/main.module#MainModule'
  },
  {
    path: 'admin',
    canActivate: [AuthenticatedGuard],
    loadChildren: 'app/admin/admin.module#AdminModule',
    data: { hideScroll: true }
  },
  {
    path: 'pdf/:source',
    canActivate: [AuthenticatedGuard],
    component: PdfComponent,
    data: { hideScroll: true }
  },
];

@NgModule({
  declarations: [
    AppComponent,
    GoogleSigninComponent,

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
      appRoutes
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
    { provide: HTTP_INTERCEPTORS, useClass: ProgressInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
