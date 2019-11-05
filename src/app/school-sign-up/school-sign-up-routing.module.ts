import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SchoolSignUpComponent } from './school-sign-up.component';

const routes: Routes = [
  { path: '', component: SchoolSignUpComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolSignUpRoutingModule { }
