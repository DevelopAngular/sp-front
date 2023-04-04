import { NgModule, NgZone } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { FeatureFlagGuard } from '../guards/feature_flag.guard';
import { FeatureFlagService, FLAGS } from '../services/feature-flag.service';
import { HttpService } from '../services/http-service';
import { CommonModule } from '@angular/common';

const routes: Routes = [
	{
		path: '',
		component: AdminPageComponent,
		children: [
			{ path: 'gettingstarted', loadChildren: () => import('app/admin/getting-started/getting-started.module').then((m) => m.GettingStartedModule) },
			{ path: 'dashboard', loadChildren: () => import('app/admin/dashboard/dashboard.module').then((m) => m.DashboardModule) },
			{ path: 'hallmonitor', loadChildren: () => import('app/admin/hallmonitor/hallmonitor.module').then((m) => m.HallmonitorModule) },
			{ path: 'explore', loadChildren: () => import('app/admin/explore/explore.module').then((m) => m.ExploreModule) },
			{ path: 'accounts', loadChildren: () => import('app/admin/accounts/accounts.module').then((m) => m.AccountsModule) },
			{ path: 'passconfig', loadChildren: () => import('app/admin/pass-config/pass-config.module').then((m) => m.PassConfigModule) },
			{ path: 'myschool', loadChildren: () => import('app/admin/my-school/my-school.module').then((m) => m.MySchoolModule) },
			{ path: 'idcards', loadChildren: () => import('app/admin/id-cards/id-cards.module').then((m) => m.IdCardsModule) },
			{
				path: 'renewal',
				loadChildren: () => import('app/admin/renewal/renewal.module').then((m) => m.RenewalModule),
				canActivate: [FeatureFlagGuard],
				data: { feature_flag: FLAGS.RenewalChecklist },
			},
			{ path: '**', redirectTo: '', pathMatch: 'full' },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes), CommonModule],
	exports: [RouterModule],
})
export class AdminRoutingModule {}
