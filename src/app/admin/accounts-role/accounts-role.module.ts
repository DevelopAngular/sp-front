import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoleRoutingModule } from './accounts-role-routing.module';
import { AccountsRoleComponent } from './accounts-role.component';
import { AdminSharedModule } from '../shared/admin-shared.module';

@NgModule({
  declarations: [
    AccountsRoleComponent
  ],
  imports: [
    CommonModule,
    AccountsRoleRoutingModule,
    AdminSharedModule
  ]
})
export class AccountsRoleModule { }
