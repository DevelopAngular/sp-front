import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { MobileRestrictionRoutingModule } from './mobile-restriction-routing.module';

import { MobileRestrictionComponent } from '../mobile-restriction/mobile-restriction.component';

@NgModule({
	imports: [CommonModule, SharedModule, MobileRestrictionRoutingModule, FormsModule, ReactiveFormsModule],
	declarations: [MobileRestrictionComponent],
	providers: [],
})
export class MobileRestrictionModule {}
