import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KioskModeComponent } from './kiosk-mode.component';

const routes: Routes = [
  { path: '', component: KioskModeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KioskModeRoutingModule { }
