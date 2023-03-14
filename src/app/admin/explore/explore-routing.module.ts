import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExploreComponent } from './explore.component';

const routes: Routes = [
	{ path: '', component: ExploreComponent },
	{ path: 'passes', component: ExploreComponent },
	{ path: 'report-submissions', component: ExploreComponent },
	{ path: 'contact-trace', component: ExploreComponent },
	{ path: 'detected-encounters', component: ExploreComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ExploreRoutingModule {}
