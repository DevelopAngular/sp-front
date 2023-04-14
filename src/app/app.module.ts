import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgmCoreModule } from '@agm/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { provideErrorHandler } from './error-handler';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { IsStudentOrTeacherGuard } from './guards/is-student-or-teacher.guard';
import { NotSeenIntroGuard } from './guards/not-seen-intro.guard';
import { ProgressInterceptor } from './progress-interceptor';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { environment } from '../environments/environment';
import { APP_BASE_HREF } from '@angular/common';
import { NotKioskModeGuard } from './not-kiosk-mode.guard';
import { OverlayContainer } from '@angular/cdk/overlay';
import { InitOverlay } from './consent-menu-overlay';
import { SWIPER_CONFIG, SwiperConfigInterface, SwiperModule } from 'ngx-swiper-wrapper';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducers } from './ngrx/app-state/app-state';
import { AccountsEffects } from './ngrx/accounts/effects/accounts.effects';
import { AllAccountsEffects } from './ngrx/accounts/nested-states/all-accounts/effects';
import { AdminsEffects } from './ngrx/accounts/nested-states/admins/effects';
import { ReportsEffects } from './ngrx/reports';
import { PinnablesEffects } from './ngrx/pinnables/effects';
import { TeachersEffects } from './ngrx/accounts/nested-states/teachers/effects';
import { AssistantsEffects } from './ngrx/accounts/nested-states/assistants/effects';
import { StudentsEffects } from './ngrx/accounts/nested-states/students/effects';
import { CountAccountsEffects } from './ngrx/accounts/nested-states/count-accounts/effects';
import { PassStatsEffects } from './ngrx/pass-stats/effects';
import { DashboardEffects } from './ngrx/dashboard/effects';
import { StudentGroupsEffects } from './ngrx/student-groups/effects';
import { TeacherLocationsEffects } from './ngrx/teacherLocations/effects';
import { LocationsEffects } from './ngrx/locations/effects';
import { FavoriteLocationsEffects } from './ngrx/favorite-locations/effects';
import { ColorsEffects } from './ngrx/color-profiles/effects';
import { SchoolsEffects } from './ngrx/schools/effects';
import { UserEffects } from './ngrx/user/effects';
import { ProcessEffects } from './ngrx/onboard-process/effects';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { CoreModule } from './core/core.module';
import { ScrollHolderDirective } from './scroll-holder.directive';
import { OAuthModule } from 'angular-oauth2-oidc';
import { NextReleaseModule } from './next-release/next-release.module';
import { SupportButtonComponent } from './support/support-button/support-button.component';
import { PassLimitEffects } from './ngrx/pass-limits/effects';
import { CustomToastComponent } from './custom-toast/custom-toast.component';
import { PassesEffects } from './ngrx/passes';
import { ContactTraceEffects } from './ngrx/contact-trace/effects';
import { IntrosEffects } from './ngrx/intros';
import { FiltersEffects } from './ngrx/pass-filters/effects';
import { InvitationsEffects } from './ngrx/pass-like-collection/nested-states/invitations/effects';
import { PassLikeCollectionEffects } from './ngrx/pass-like-collection/effects/pass-like-collection.effects';
import { RequestsEffects } from './ngrx/pass-like-collection/nested-states/requests/effects';
import { ExpiredPassesEffects } from './ngrx/pass-like-collection/nested-states/expired-passes/effects';
import { FuturePassesEffects } from './ngrx/pass-like-collection/nested-states/future-passes/effects';
import { ActivePassesEffects } from './ngrx/pass-like-collection/nested-states/active-passes/effects';
import { ToLocationPassesEffects } from './ngrx/pass-like-collection/nested-states/to-location/effects';
import { FromLocationPassesEffects } from './ngrx/pass-like-collection/nested-states/from-location/effects';
import { HallMonitorPassesEffects } from './ngrx/pass-like-collection/nested-states/hall-monitor-passes/effects';
import { MyRoomPassesEffects } from './ngrx/pass-like-collection/nested-states/my-room-passes/effects';
import { RepresentedUsersEffects } from './ngrx/represented-users/effects';
import { QuickPreviewPassesEffects } from './ngrx/quick-preview-passes/effects';
import { ProfilePicturesEffects } from './ngrx/profile-pictures/effects';
import { ExclusionGroupsEffects } from './ngrx/encounters-prevention/excusion-groups/effects';
import { ToastEffects } from './ngrx/toast/effects';
import { SmartpassSearchEffects } from './ngrx/smartpass-search/effects';
import { IdcardOverlayContainerComponent } from './idcard-overlay-container/idcard-overlay-container.component';
import { EncounterDetectionEffects } from './ngrx/encounter-detection';
import { SharedModule } from './shared/shared.module';
import { ParentsEffects } from './ngrx/accounts/nested-states/parents/effects';
import { IsParentGuard } from './guards/is-parent.guard';
import { AuthInterceptor } from './auth.interceptor';
import { LoginService } from './services/login.service';
import { CookieService } from 'ngx-cookie-service';
import { StreaksDialogComponent } from './streaks-dialog/streaks-dialog.component';
// uncomment when app uses formatDate and so on
//import {LOCALE_ID} from '@angular/core';
//import {HttpService} from './services/http-service';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
	direction: 'horizontal',
	slidesPerView: 'auto',
};

// @ts-ignore
const appRoutes: Routes = [
	{
		path: 'main/intro',
		canActivate: [AuthenticatedGuard],
		loadChildren: () => import('app/intro-route/intro-route.module').then((m) => m.IntroRouteModule),
		data: { hideSchoolToggleBar: true },
	},
	{
		path: '',
		loadChildren: () => import('app/auth/login.module').then((m) => m.LoginModule),
		data: { hideSchoolToggleBar: true },
	},
	{
		path: 'google_oauth',
		loadChildren: () => import('app/auth/login.module').then((m) => m.LoginModule),
		data: { hideSchoolToggleBar: true },
	},
	{
		path: 'classlink_oauth',
		loadChildren: () => import('app/auth/login.module').then((m) => m.LoginModule),
		data: { hideSchoolToggleBar: true },
	},
	{
		path: 'main',
		canActivate: [NotSeenIntroGuard, AuthenticatedGuard, IsStudentOrTeacherGuard],
		loadChildren: () => import('app/main/main.module').then((m) => m.MainModule),
		data: {
			hubspot: true,
			authFree: false,
		},
	},
	{
		path: 'admin',
		canActivate: [NotSeenIntroGuard, AuthenticatedGuard, NotKioskModeGuard, IsAdminGuard],
		loadChildren: () => import('app/admin/admin.module').then((m) => m.AdminModule),
		data: {
			hubspot: true,
			authFree: false,
		},
	},
	{
		path: 'parent',
		canActivate: [AuthenticatedGuard, IsParentGuard],
		loadChildren: () => import('app/parent/parent.module').then((m) => m.ParentModule),
		data: {
			hideSchoolToggleBar: true,
			hubspot: false,
			authFree: true,
		},
	},
	{
		path: 'sign-out',
		loadChildren: () => import('app/sign-out/sign-out.module').then((m) => m.SignOutModule),
	},
	{
		path: 'forms',
		loadChildren: () => import('app/forms/forms.module').then((m) => m.FormsModule),
		data: { hideSchoolToggleBar: true, hubspot: false, authFree: true, hideScroll: false },
	},
	{
		path: 'links',
		loadChildren: () => import('app/weblinks/weblinks.module').then((m) => m.WeblinksModule),
		data: { hideSchoolToggleBar: true, hubspot: false, authFree: true, hideScroll: false },
	},
	{
		path: 'mobile-restriction',
		loadChildren: () => import('app/mobile-restriction/mobile-restriction.module').then((m) => m.MobileRestrictionModule),
	},
	{ path: '**', redirectTo: 'main/passes', pathMatch: 'full' },
];

@NgModule({
	declarations: [
		AppComponent,
		ScrollHolderDirective,
		SupportButtonComponent,
		CustomToastComponent,
		IdcardOverlayContainerComponent,
		StreaksDialogComponent,
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

		RouterModule.forRoot(appRoutes, {
			enableTracing: false,
		}),
		OAuthModule.forRoot(),
		AngularFireModule.initializeApp(environment.firebase, 'notifyhallpass'),
		AngularFireMessagingModule,
		AgmCoreModule.forRoot({
			apiKey: 'AIzaSyB-PvmYU5y4GQXh1aummcUI__LNhCtI68o',
			libraries: ['places'],
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
			HallMonitorPassesEffects,
			MyRoomPassesEffects,
			FiltersEffects,
			RepresentedUsersEffects,
			QuickPreviewPassesEffects,
			ProfilePicturesEffects,
			ExclusionGroupsEffects,
			ToastEffects,
			SmartpassSearchEffects,
			EncounterDetectionEffects,
			ParentsEffects,
		]),
		StoreDevtoolsModule.instrument({}),
		HammerModule,
		SharedModule,
	],
	providers: [
		CookieService,
		{ provide: OverlayContainer, useFactory: InitOverlay },
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true, deps: [LoginService] },
		{ provide: HTTP_INTERCEPTORS, useClass: ProgressInterceptor, multi: true },
		// { provide: HTTP_INTERCEPTORS, useClass: AccessTokenInterceptor, multi: true },
		{ provide: APP_BASE_HREF, useValue: '/' },
		{ provide: SWIPER_CONFIG, useValue: DEFAULT_SWIPER_CONFIG },
		// uncomment when app uses formatDate and so on
		/*{
      provide: LOCALE_ID,
      deps:[HttpService],
      useFactory: (hs: HttpService) => hs.LocaleID,
    }*/ provideErrorHandler(),
	],
	bootstrap: [AppComponent],
})
export class AppModule {
	constructor() {}
}
