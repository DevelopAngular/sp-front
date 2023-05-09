import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReferralsRoutingModule } from './referrals-routing.module';
import { ReferralPageComponent } from './referral-page/referral-page.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [ReferralPageComponent],
	imports: [CommonModule, ReferralsRoutingModule, SharedModule],
})
export class ReferralsModule {}
