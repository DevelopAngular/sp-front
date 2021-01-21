import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AccountsComponent} from './accounts.component';

const routes: Routes = [
  { path: '', component: AccountsComponent,
    children: [
      { path: ':role', loadChildren: () => import('app/admin/accounts-role/accounts-role.module').then(m => m.AccountsRoleModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
