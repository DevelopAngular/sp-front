import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PredemoComponent } from './predemo/predemo.component';
import { QuoteRequestComponent } from './quote-request/quote-request.component';

const routes: Routes = [
  {path: 'predemo', component: PredemoComponent},
  {path: 'quoterequest', component: QuoteRequestComponent},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormsRoutingModule { }
