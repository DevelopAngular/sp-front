import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import {AccountsComponent} from './accounts.component';
import {MainComponent} from './main/main.component';
import {SharedModule} from '../../shared/shared.module';
import { GSuiteDialogComponent } from './dialogs/g-suite-dialog/g-suite-dialog.component';
import { AdministratorsComponent } from './administrators/administrators.component';
import { AddAccountDialogComponent } from './dialogs/add-account-dialog/add-account-dialog.component';
import { EditRestrictionsDialogComponent } from './dialogs/edit-restrictions-dialog/edit-restrictions-dialog.component';
import { RemoveAccountDialogComponent } from './dialogs/remove-account-dialog/remove-account-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    AccountsRoutingModule,
    SharedModule
  ],
  entryComponents: [GSuiteDialogComponent, AddAccountDialogComponent, EditRestrictionsDialogComponent, RemoveAccountDialogComponent],
  declarations: [
    AccountsComponent,
    MainComponent,
    GSuiteDialogComponent,
    AdministratorsComponent,
    AddAccountDialogComponent,
    EditRestrictionsDialogComponent,
    RemoveAccountDialogComponent
  ]
})
export class AccountsModule { }
