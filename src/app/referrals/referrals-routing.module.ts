import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReferralPageComponent } from './referral-page/referral-page.component';

const routes: Routes = [{ path: '', component: ReferralPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ReferralsRoutingModule {}
