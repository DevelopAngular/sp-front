import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { HallmonitorComponent } from './hallmonitor/hallmonitor.component';
import { SearchComponent } from './search/search.component';
import { PassConfigComponent } from './pass-config/pass-config.component';
import {AccountsComponent} from './accounts/accounts.component';
import {AccountsRoleComponent} from './accounts-role/accounts-role.component';
import {SettingsComponent} from './settings/settings.component';

const routes: Routes = [
  {
    path: '', component: AdminPageComponent,
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'hallmonitor', component: HallmonitorComponent},
      {path: 'search', component: SearchComponent},
      {path: 'accounts', component: AccountsComponent},
      {path: 'accounts/:role', component: AccountsRoleComponent},
      {path: 'passconfig', component: PassConfigComponent},
      {path: 'settings', component: SettingsComponent},
      // {path: 'feedback', component: FeedbackComponent},
      // {path: 'support', component: SupportComponent},
      {path: '**', redirectTo: 'dashboard', pathMatch: 'full'},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
