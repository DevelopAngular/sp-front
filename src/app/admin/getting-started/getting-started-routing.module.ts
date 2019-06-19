import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GettingStartedComponent } from './getting-started.component';
import { TakeTourComponent } from './take-tour/take-tour.component';

const routes: Routes = [
  {
    path: '',
    component: GettingStartedComponent,
  },
  {
    path: 'takeTour',
    component: TakeTourComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GettingStartedRoutingModule { }
