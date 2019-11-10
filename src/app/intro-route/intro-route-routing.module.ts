import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntroRouteComponent } from './intro-route.component';

const routes: Routes = [
  { path: '', component: IntroRouteComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IntroRouteRoutingModule { }
