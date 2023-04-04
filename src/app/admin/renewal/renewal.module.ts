import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RenewalComponent } from './renewal.component';
import { RenewalRoutingModule } from './renewal-routing.module';
import { CountdownComponent } from './countdown/countdown.component';
import { TeamMemberComponent } from './team-member/team-member.component';
import { ActionItemComponent } from './action-item/action-item.component';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
	declarations: [RenewalComponent, CountdownComponent, TeamMemberComponent, ActionItemComponent],
	imports: [CommonModule, RenewalRoutingModule, CoreModule, SharedModule],
})
export class RenewalModule {}
