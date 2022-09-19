import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { MobileRestrictionComponent } from '../mobile-restriction/mobile-restriction.component';

const routes: Routes = [
  {
    path: '', component: MobileRestrictionComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MobileRestrictionRoutingModule {
}
