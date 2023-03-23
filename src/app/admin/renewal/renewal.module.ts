import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RenewalComponent } from './renewal.component';
import { RenewalRoutingModule } from './renewal-routing.module';

@NgModule({
	declarations: [RenewalComponent],
	imports: [CommonModule, RenewalRoutingModule],
})
export class RenewalModule {}
