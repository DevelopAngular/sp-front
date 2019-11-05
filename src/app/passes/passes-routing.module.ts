import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PassesComponent } from './passes.component';

const routes: Routes = [
  { path: '', component: PassesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PassesRoutingModule { }
