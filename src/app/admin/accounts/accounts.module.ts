import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import {AccountsComponent} from './accounts.component';
import {MainComponent} from './main/main.component';
import {SharedModule} from '../../shared/shared.module';
import { GSuiteDialogComponent } from './g-suite-dialog/g-suite-dialog.component';
import { AdministratorsComponent } from './administrators/administrators.component';
import {AdminSharedModule} from '../shared/admin-shared.module';

@NgModule({
  imports: [
    CommonModule,
    AccountsRoutingModule,
    SharedModule,
    AdminSharedModule,
  ],
  declarations: [
    AccountsComponent,
    MainComponent,
    GSuiteDialogComponent,
    AdministratorsComponent
  ]
})
export class AccountsModule { }
