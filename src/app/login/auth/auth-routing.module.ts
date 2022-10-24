import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParentLoginComponent } from './parent-login/parent-login.component';
import { ParentSignUpComponent } from './parent-sign-up/parent-sign-up.component';

const routes: Routes = [
  {path: '', component: ParentLoginComponent },
  {path: 'signup', component: ParentSignUpComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
