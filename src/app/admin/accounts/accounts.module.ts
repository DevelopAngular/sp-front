import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { SharedModule } from '../../shared/shared.module';
import { AdminSharedModule } from '../shared/admin-shared.module';

@NgModule({
  declarations: [
    AccountsComponent
  ],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    SharedModule,
    AdminSharedModule
  ]
})
export class AccountsModule { }
