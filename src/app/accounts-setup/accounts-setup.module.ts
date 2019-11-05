import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsSetupRoutingModule } from './accounts-setup-routing.module';
import { AccountsSetupComponent } from './accounts-setup.component';
import { SharedModule } from '../shared/shared.module';
import {AdminSharedModule} from '../admin/shared/admin-shared.module';

@NgModule({
  declarations: [
    AccountsSetupComponent
  ],
  imports: [
    CommonModule,
    AccountsSetupRoutingModule,
    SharedModule,
    AdminSharedModule
  ]
})
export class AccountsSetupModule { }
