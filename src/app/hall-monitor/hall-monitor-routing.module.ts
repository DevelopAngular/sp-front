import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HallMonitorComponent } from './hall-monitor.component';

const routes: Routes = [
  { path: '', component: HallMonitorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HallMonitorRoutingModule { }
