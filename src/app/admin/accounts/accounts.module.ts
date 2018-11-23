import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { MainComponent } from './main/main.component';
import { SharedModule } from '../../shared/shared.module';
import { GSuiteDialogComponent } from './dialogs/g-suite-dialog/g-suite-dialog.component';
import { AdministratorsComponent } from './administrators/administrators.component';
import { AdminSharedModule } from '../shared/admin-shared.module';
import { AddAccountDialogComponent } from './dialogs/add-account-dialog/add-account-dialog.component';
import { EditRestrictionsDialogComponent } from './dialogs/edit-restrictions-dialog/edit-restrictions-dialog.component';
import { RemoveAccountDialogComponent } from './dialogs/remove-account-dialog/remove-account-dialog.component';
import { TeachersComponent } from './teachers/teachers.component';
import { StudentsComponent } from './students/students.component';
import { SubsitutesComponent } from './subsitutes/subsitutes.component';
import { AddRoomsDialogComponent } from './dialogs/add-rooms-dialog/add-rooms-dialog.component';
import { AddTeacherProfileDialogComponent } from './dialogs/add-teacher-profile-dialog/add-teacher-profile-dialog.component';

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
    AdministratorsComponent,
    AddAccountDialogComponent,
    EditRestrictionsDialogComponent,
    RemoveAccountDialogComponent,
    TeachersComponent,
    StudentsComponent,
    SubsitutesComponent,
    AddRoomsDialogComponent,
    AddTeacherProfileDialogComponent,
  ],
  entryComponents: [
    GSuiteDialogComponent,
    AddTeacherProfileDialogComponent,
    AddRoomsDialogComponent,
    AddAccountDialogComponent,
    EditRestrictionsDialogComponent,
    RemoveAccountDialogComponent
  ],
})
export class AccountsModule { }
