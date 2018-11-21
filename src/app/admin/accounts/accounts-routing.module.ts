import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import {AccountsComponent} from './accounts.component';
import {GSuiteDialogComponent} from './g-suite-dialog/g-suite-dialog.component';
import {AdministratorsComponent} from './administrators/administrators.component';

const routes: Routes = [
  {
    path: '',
    component: AccountsComponent,
    children: [
      {
        path: '',
        component: MainComponent
      },
      {
        path: 'd',
        component: GSuiteDialogComponent
      },
      {
        path: 'administrators',
        component: AdministratorsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
