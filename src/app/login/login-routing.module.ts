import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParentLoginComponent } from './auth/parent-login/parent-login.component';
import { ParentSignUpComponent } from './auth/parent-sign-up/parent-sign-up.component';
import { LoginComponent } from './login.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {path: 'auth', loadChildren: () => import('app/login/auth/auth.module').then(m => m.AuthModule)},
  // { path: 'auth/parent/signup', component: ParentSignUpComponent },
  // { path: 'auth/parent/login', component: ParentLoginComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
