import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './login-page.component';
import { ParentSignUpComponent } from './parent-sign-up/parent-sign-up.component';

const routes: Routes = [
	{ path: 'parent-sign-up', component: ParentSignUpComponent, pathMatch: 'full' },
	{ path: '', component: LoginPageComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class LoginRoutingModule {}
