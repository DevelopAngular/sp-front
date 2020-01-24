import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { AdminCardButtonComponent } from './admin-card-button/admin-card-button.component';
import { AdminSharedModule } from '../shared/admin-shared.module';
import { AccountsSyncComponent } from './accounts-sync/accounts-sync.component';

@NgModule({
  declarations: [
    AccountsComponent,
    AdminCardButtonComponent,
    AccountsSyncComponent
  ],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    AdminSharedModule,
  ]
})
export class AccountsModule {
}
