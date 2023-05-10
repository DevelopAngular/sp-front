import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReferralsRoutingModule } from './referrals-routing.module';
import { ReferralPageComponent } from './referral-page/referral-page.component';
import { SharedModule } from '../shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReferralJoinComponent } from './referral-join/referral-join.component';

@NgModule({
	declarations: [ReferralPageComponent, ReferralJoinComponent],
	imports: [CommonModule, ReferralsRoutingModule, SharedModule, MatCheckboxModule],
})
export class ReferralsModule {}
