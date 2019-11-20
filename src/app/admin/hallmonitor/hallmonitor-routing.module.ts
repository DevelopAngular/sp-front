import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HallmonitorComponent } from './hallmonitor.component';

const routes: Routes = [
  { path: '', component: HallmonitorComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HallmonitorRoutingModule { }
