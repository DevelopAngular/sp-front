import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountsRoleComponent } from './accounts-role.component';

const routes: Routes = [
  { path: '', component: AccountsRoleComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoleRoutingModule { }
