import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule, HammerModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AgmCoreModule} from '@agm/core';
import {RouterModule, Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {GAPI_CONFIG} from './config';
import {CurrentUserResolver} from './current-user.resolver';
import {DataService} from './services/data-service';
import {provideErrorHandler} from './error-handler';
import {GoogleLoginService} from './services/google-login.service';
import {AuthenticatedGuard} from './guards/authenticated.guard';
import {IsAdminGuard} from './guards/is-admin.guard';
import {IsStudentOrTeacherGuard} from './guards/is-student-or-teacher.guard';
import {NotSeenIntroGuard} from './guards/not-seen-intro.guard';
import {HttpService} from './services/http-service';
import {LoadingService} from './services/loading.service';
import {ProgressInterceptor} from './progress-interceptor';
import {GoogleApiService, SP_GAPI_CONFIG} from './services/google-api.service';
import {GoogleAuthService} from './services/google-auth.service';
import {UserService} from './services/user.service';
import {NotificationService} from './services/notification-service';
import {AngularFireModule} from '@angular/fire';
import {AngularFireMessagingModule} from '@angular/fire/messaging';
import {environment} from '../environments/environment';
import {APP_BASE_HREF} from '@angular/common';
import {NotKioskModeGuard} from './not-kiosk-mode.guard';
import {KioskModeService} from './services/kiosk-mode.service';
import {OverlayContainer} from '@angular/cdk/overlay';
import {InitOverlay} from './consent-menu-overlay';
import {SWIPER_CONFIG, SwiperConfigInterface, SwiperModule} from 'ngx-swiper-wrapper';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {reducers} from './ngrx/app-state/app-state';
import {AccountsEffects} from './ngrx/accounts/effects/accounts.effects';
import {AllAccountsEffects} from './ngrx/accounts/nested-states/all-accounts/effects';
import {AdminsEffects} from './ngrx/accounts/nested-states/admins/effects';
import {ReportsEffects} from './ngrx/reports/effects';
import {PinnablesEffects} from './ngrx/pinnables/effects';
import {TeachersEffects} from './ngrx/accounts/nested-states/teachers/effects';
import {AssistantsEffects} from './ngrx/accounts/nested-states/assistants/effects';
import {StudentsEffects} from './ngrx/accounts/nested-states/students/effects';
import {CountAccountsEffects} from './ngrx/accounts/nested-states/count-accounts/effects';
import {PassStatsEffects} from './ngrx/pass-stats/effects';
import {DashboardEffects} from './ngrx/dashboard/effects';
import {StudentGroupsEffects} from './ngrx/student-groups/effects';
import {TeacherLocationsEffects} from './ngrx/teacherLocations/effects';
import {LocationsEffects} from './ngrx/locations/effects';
import {FavoriteLocationsEffects} from './ngrx/favorite-locations/effects';
import {ColorsEffects} from './ngrx/color-profiles/effects';
import {SchoolsEffects} from './ngrx/schools/effects';
import {UserEffects} from './ngrx/user/effects';
import {ProcessEffects} from './ngrx/onboard-process/effects';
import {KeyboardShortcutsModule} from 'ng-keyboard-shortcuts';
import {CoreModule} from './core/core.module';
import {ScrollHolderDirective} from './scroll-holder.directive';
import {OAuthModule} from 'angular-oauth2-oidc';
import {SchoolSignUpGuard} from './guards/school-sign-up.guard';
import {NextReleaseModule} from './next-release/next-release.module';
import {SupportButtonComponent} from './support-button/support-button.component';
import {PassLimitEffects} from './ngrx/pass-limits/effects';
import {CustomToastComponent} from './custom-toast/custom-toast.component';
import {PassesEffects} from './ngrx/passes/effects';
import {ContactTraceEffects} from './ngrx/contact-trace/effects';
import {IntrosEffects} from './ngrx/intros/effects/intros.effects';
import {ServiceWorkerModule} from '@angular/service-worker';
import {AccessTokenInterceptor} from './services/AccessTokenInterceptor';
import {InvitationsEffects} from './ngrx/pass-like-collection/nested-states/invitations/effects';
import {PassLikeCollectionEffects} from './ngrx/pass-like-collection/effects/pass-like-collection.effects';
import {RequestsEffects} from './ngrx/pass-like-collection/nested-states/requests/effects';
import {ExpiredPassesEffects} from './ngrx/pass-like-collection/nested-states/expired-passes/effects';
import {FuturePassesEffects} from './ngrx/pass-like-collection/nested-states/future-passes/effects';
import {ActivePassesEffects} from './ngrx/pass-like-collection/nested-states/active-passes/effects';
import {ToLocationPassesEffects} from './ngrx/pass-like-collection/nested-states/to-location/effects';
import {FromLocationPassesEffects} from './ngrx/pass-like-collection/nested-states/from-location/effects';
import {HallMonitorPassesEffects} from './ngrx/pass-like-collection/nested-states/hall-monitor-passes/effects';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};


// @ts-ignore
const appRoutes: Routes = [
  {
    path: 'main/intro',
    canActivate: [AuthenticatedGuard],
    loadChildren: () => import('app/intro-route/intro-route.module').then(m => m.IntroRouteModule),
    data: { hideSchoolToggleBar: true}
  },
  {
    path: 'school_signup',
    canActivate: [SchoolSignUpGuard],
    loadChildren: () => import('app/school-sign-up/school-sign-up.module').then(m => m.SchoolSignUpModule),
    data: {hideSchoolToggleBar: true, hideScroll: true, hubspot: false, authFree: true},
  },
  {
    path: '',
    loadChildren: () => import('app/login/login.module').then(m => m.LoginModule),
    data: { hideSchoolToggleBar: true}
  },
  {
    path: 'main',
    canActivate: [NotSeenIntroGuard, AuthenticatedGuard, IsStudentOrTeacherGuard],
    loadChildren: () => import('app/main/main.module').then(m => m.MainModule),
    resolve: {currentUser: CurrentUserResolver},
    data: {
      hubspot: true,
      authFree: false
    }
  },
  {
    path: 'admin',
    canActivate: [NotSeenIntroGuard, AuthenticatedGuard, NotKioskModeGuard, IsAdminGuard],
    loadChildren: () => import('app/admin/admin.module').then(m => m.AdminModule),
    resolve: {currentUser: CurrentUserResolver},
    data: {
      hideScroll: true,
      hubspot: true,
      authFree: false
    }
  },
  {
    path: 'sign-out',
    loadChildren: () => import('app/sign-out/sign-out.module').then(m => m.SignOutModule)
  },
  {
    path: 'error',
    loadChildren: () => import('app/error/error.module').then(m => m.ErrorModule)
  },

  {path: '**', redirectTo: 'main/passes', pathMatch: 'full'},
];

@NgModule({
  declarations: [
    AppComponent,
    ScrollHolderDirective,
    SupportButtonComponent,
    CustomToastComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SwiperModule,
    CoreModule,
    NextReleaseModule,
    KeyboardShortcutsModule.forRoot(),

        RouterModule.forRoot(
            appRoutes,
            {
                enableTracing: false,
            }
        ),
        OAuthModule.forRoot(),
        AngularFireModule.initializeApp(environment.firebase, 'notifyhallpass'),
        AngularFireMessagingModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyB-PvmYU5y4GQXh1aummcUI__LNhCtI68o',
            libraries: ['places']
        }),
        StoreModule.forRoot(reducers),
        EffectsModule.forRoot([
            ReportsEffects,
            PinnablesEffects,
            AccountsEffects,
            AllAccountsEffects,
            AdminsEffects,
            TeachersEffects,
            AssistantsEffects,
            StudentsEffects,
            CountAccountsEffects,
            TeacherLocationsEffects,
            DashboardEffects,
            PassStatsEffects,
            StudentGroupsEffects,
            LocationsEffects,
            FavoriteLocationsEffects,
            ColorsEffects,
            SchoolsEffects,
            UserEffects,
            ProcessEffects,
            PassLimitEffects,
            PassesEffects,
            ContactTraceEffects,
            IntrosEffects,
            PassLikeCollectionEffects,
            InvitationsEffects,
            RequestsEffects,
            ExpiredPassesEffects,
            FuturePassesEffects,
            ActivePassesEffects,
            ToLocationPassesEffects,
            FromLocationPassesEffects,
            HallMonitorPassesEffects
        ]),
        StoreDevtoolsModule.instrument({}),
        HammerModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
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
        {provide: HTTP_INTERCEPTORS, useClass: AccessTokenInterceptor, multi: true},
        {provide: SP_GAPI_CONFIG, useValue: GAPI_CONFIG},
        {provide: APP_BASE_HREF, useValue: environment.production ? '/app' : '/'},
        {provide: SWIPER_CONFIG, useValue: DEFAULT_SWIPER_CONFIG},
        provideErrorHandler()
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {}
}
