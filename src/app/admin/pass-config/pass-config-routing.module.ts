import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PassConfigComponent } from './pass-config.component';

const routes: Routes = [
  { path: '', component: PassConfigComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PassConfigRoutingModule { }
