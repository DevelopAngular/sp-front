import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountsComponent } from './accounts.component';

const routes: Routes = [
  { path: '', component: AccountsComponent,
    children: [
      { path: ':role', loadChildren: 'app/admin/accounts-role/accounts-role.module#AccountsRoleModule' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
