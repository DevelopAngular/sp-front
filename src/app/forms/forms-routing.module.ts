import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PredemoComponent } from './predemo/predemo.component';
import { QuoteRequestComponent } from './quote-request/quote-request.component';
import { AddSchoolComponent } from './add-school/add-school.component';

const routes: Routes = [
  {path: 'predemo', component: PredemoComponent},
  {path: 'quoterequest', component: QuoteRequestComponent},
  {path: 'addschool', component: AddSchoolComponent},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormsRoutingModule { }
