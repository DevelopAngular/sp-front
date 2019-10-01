import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { HallmonitorComponent } from './hallmonitor/hallmonitor.component';
import { SearchComponent } from './search/search.component';
import { PassConfigComponent } from './pass-config/pass-config.component';
import {AccountsComponent} from './accounts/accounts.component';
import {AccountsRoleComponent} from './accounts-role/accounts-role.component';
import {MySchoolComponent} from './my-school/my-school.component';
import {IosComponentComponent} from './ios-component/ios-component.component';

const routes: Routes = [
  {
    path: '', component: AdminPageComponent,
    children: [
      {path: 'gettingstarted', loadChildren: 'app/admin/getting-started/getting-started.module#GettingStartedModule'},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'hallmonitor', component: HallmonitorComponent},
      {path: 'search', component: SearchComponent},
      {path: 'accounts', component: AccountsComponent },
      {path: 'accounts/:role', component: AccountsRoleComponent },
      {path: 'passconfig', component: PassConfigComponent},
      {path: 'myschool', component: MySchoolComponent},
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
