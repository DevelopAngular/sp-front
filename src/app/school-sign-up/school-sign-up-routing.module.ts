import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParentSignUpComponent } from '../parent-sign-up/parent-sign-up.component';
import { SchoolSignUpComponent } from './school-sign-up.component';

const routes: Routes = [
  { path: '', component: SchoolSignUpComponent },
  { path: 'parent', component: ParentSignUpComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolSignUpRoutingModule { }
