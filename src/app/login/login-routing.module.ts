import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { ParentSignUpComponent } from './parent-sign-up/parent-sign-up.component';

const routes: Routes = [
  { path: 'parent-sign-up', component: ParentSignUpComponent, pathMatch: 'full' },
  { path: '', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
