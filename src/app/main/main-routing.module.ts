import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from '../main-page/main-page.component';
import { SettingsComponent } from '../settings/settings.component';
import { NotKioskModeGuard } from '../not-kiosk-mode.guard';
import { IsTeacherOrAdminGuard } from '../guards/is-teacher-or-admin.guard';
import { FeatureFlagGuard } from '../guards/feature_flag.guard';
import { FLAGS } from '../services/feature-flag.service';

const routes: Routes = [
	{
		path: '',
		component: MainPageComponent,
		children: [
			{ path: '', redirectTo: 'passes', pathMatch: 'full' },
			{ path: 'passes', loadChildren: () => import('app/passes/passes.module').then((m) => m.PassesModule), canActivate: [NotKioskModeGuard] },
			{
				path: 'hallmonitor',
				loadChildren: () => import('app/hall-monitor/hall-monitor.module').then((m) => m.HallMonitorModule),
				canActivate: [NotKioskModeGuard],
			},
			{ path: 'myroom', loadChildren: () => import('app/my-room/my-room.module').then((m) => m.MyRoomModule), canActivate: [NotKioskModeGuard] },
			{ path: 'kioskMode', loadChildren: () => import('app/kiosk-mode/kiosk-mode.module').then((m) => m.KioskModeModule) },
			{ path: 'student/:id', loadChildren: () => import('app/student-info-card/student-info-card.module').then((m) => m.StudentInfoCardModule) },
			{ path: 'settings', component: SettingsComponent },
			{
				path: 'refer_us',
				loadChildren: () => import('app/referrals/referrals.module').then((m) => m.ReferralsModule),
				canActivate: [IsTeacherOrAdminGuard, FeatureFlagGuard],
				data: { feature_flag: FLAGS.RenewalChecklist },
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class MainRoutingModule {}
