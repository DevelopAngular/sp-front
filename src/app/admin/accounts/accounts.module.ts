import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { AdminCardButtonComponent } from './admin-card-button/admin-card-button.component';
import { AdminSharedModule } from '../shared/admin-shared.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    AccountsComponent,
    AdminCardButtonComponent
  ],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    AdminSharedModule,
    SharedModule
  ]
})
export class AccountsModule { }
