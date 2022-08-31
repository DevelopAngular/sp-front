import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParentSignUpComponent } from '../parent-sign-up/parent-sign-up.component';
import { LoginComponent } from './login.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'parent', component: ParentSignUpComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
