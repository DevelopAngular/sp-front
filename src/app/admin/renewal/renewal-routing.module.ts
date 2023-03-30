import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RenewalComponent } from './renewal.component';

const routes: Routes = [{ path: '', component: RenewalComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class RenewalRoutingModule {}
