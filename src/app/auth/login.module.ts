import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginPageComponent } from './login-page.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { AllowMobileService } from '../services/allow-mobile.service';
import { ParentSignUpComponent } from './parent-sign-up/parent-sign-up.component';

@NgModule({
	declarations: [LoginPageComponent, ParentSignUpComponent],
	imports: [CommonModule, LoginRoutingModule, SharedModule, CoreModule],
	providers: [AllowMobileService],
})
export class LoginModule {}
