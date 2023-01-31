import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParentPageComponent } from './parent-page/parent-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
	{
		path: '',
		component: ParentPageComponent,
		children: [
			// {path: 'auth', loadChildren: () => import('app/parent/auth/auth.module').then(m => m.AuthModule)},
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
			{ path: 'dashboard', component: DashboardComponent, pathMatch: 'full' },
			{ path: 'student/:id', loadChildren: () => import('./student-info/student-info.module').then((m) => m.StudentInfoModule) },
			{ path: '**', redirectTo: '', pathMatch: 'full' },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ParentRoutingModule {}
