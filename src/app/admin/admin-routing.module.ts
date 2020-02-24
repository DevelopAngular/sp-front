import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { IosComponentComponent } from './ios-component/ios-component.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPageComponent,
    children: [
      {path: 'gettingstarted', loadChildren: 'app/admin/getting-started/getting-started.module#GettingStartedModule'},
      {path: 'dashboard', loadChildren: 'app/admin/dashboard/dashboard.module#DashboardModule'},
      {path: 'hallmonitor', loadChildren: 'app/admin/hallmonitor/hallmonitor.module#HallmonitorModule'},
      {path: 'search', loadChildren: 'app/admin/search/search.module#SearchModule'},
      {path: 'accounts', loadChildren: 'app/admin/accounts/accounts.module#AccountsModule'},
      {path: 'accounts/:role', loadChildren: 'app/admin/accounts-role/accounts-role.module#AccountsRoleModule' },
      {path: 'passconfig', loadChildren: 'app/admin/pass-config/pass-config.module#PassConfigModule'},
      {path: 'myschool', loadChildren: 'app/admin/my-school/my-school.module#MySchoolModule'},
      {path: 'ios', component: IosComponentComponent},
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
