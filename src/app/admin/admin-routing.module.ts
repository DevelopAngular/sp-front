import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { HallmonitorComponent } from './hallmonitor/hallmonitor.component';
import { SearchComponent } from './search/search.component';
import { PassConfigComponent } from './pass-config/pass-config.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { SupportComponent } from './support/support.component';

const routes: Routes = [
  {
    path: '', component: AdminPageComponent, children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'hallmonitor', component: HallmonitorComponent},
      {path: 'search', component: SearchComponent},
      {path: 'accounts', loadChildren: './accounts/accounts.module#AccountsModule'},
      {path: 'passconfig', component: PassConfigComponent},
      {path: 'feedback', component: FeedbackComponent},
      {path: 'support', component: SupportComponent}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
