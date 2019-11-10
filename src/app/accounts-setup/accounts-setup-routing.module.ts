import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountsSetupComponent } from './accounts-setup.component';

const routes: Routes = [
  { path: '', component: AccountsSetupComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsSetupRoutingModule { }
