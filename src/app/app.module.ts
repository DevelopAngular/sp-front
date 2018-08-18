import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatProgressSpinnerModule, MatSliderModule } from '@angular/material';
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
import { UserService } from './user.service';
import { LoginComponent } from './login/login.component';

const appRoutes: Routes = [
  {path: '', redirectTo: 'main/passes', pathMatch: 'full'},
  {path: 'main/intro', component: IntroComponent},
  {
    path: 'main',
    canActivate: [AuthenticatedGuard],
    loadChildren: 'app/main/main.module#MainModule'
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
  ],
  entryComponents: [
    ConsentMenuComponent,
    OptionsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,

    MatSliderModule,

    FormsModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,

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
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
