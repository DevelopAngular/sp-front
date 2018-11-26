import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import {AccountsComponent} from './accounts.component';
import {GSuiteDialogComponent} from './dialogs/g-suite-dialog/g-suite-dialog.component';
import {AdministratorsComponent} from './administrators/administrators.component';
import {TeachersComponent} from './teachers/teachers.component';
import {StudentsComponent} from './students/students.component';
import {SubsitutesComponent} from './subsitutes/subsitutes.component';

const routes: Routes = [
  {
    path: '',
    component: AccountsComponent,
    children: [
      {
        path: '',
        component: MainComponent
      },
      // {
      //   path: 'administrators',
      //   component: AdministratorsComponent
      // },
      // {
      //   path: 'teachers',
      //   component: TeachersComponent
      // },
      {
        path: '/:role',
        component: TeachersComponent
      },
      // {
      //   path: 'students',
      //   component: StudentsComponent
      // },
      // {
      //   path: 'substitutes',
      //   component: SubsitutesComponent
      // },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
