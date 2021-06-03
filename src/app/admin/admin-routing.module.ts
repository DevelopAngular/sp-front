import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminPageComponent} from './admin-page/admin-page.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPageComponent,
    children: [
      {path: 'gettingstarted', loadChildren: () => import('app/admin/getting-started/getting-started.module').then(m => m.GettingStartedModule)},
      {path: 'dashboard', loadChildren: () => import('app/admin/dashboard/dashboard.module').then(m => m.DashboardModule)},
      {path: 'hallmonitor', loadChildren: () => import('app/admin/hallmonitor/hallmonitor.module').then(m => m.HallmonitorModule)},
      {path: 'explore', loadChildren: () => import('app/admin/explore/explore.module').then(m => m.ExploreModule)},
      {path: 'accounts', loadChildren: () => import('app/admin/accounts/accounts.module').then(m => m.AccountsModule)},
      // {path: 'accounts/:role', loadChildren: 'app/admin/accounts-role/accounts-role.module#AccountsRoleModule' },
      {path: 'passconfig', loadChildren: () => import('app/admin/pass-config/pass-config.module').then(m => m.PassConfigModule)},
      {path: 'myschool', loadChildren: () => import('app/admin/my-school/my-school.module').then(m => m.MySchoolModule)},
      {path: '**', redirectTo: '', pathMatch: 'full'},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
