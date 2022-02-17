import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StudentInfoCardComponent} from './student-info-card.component';

const routes: Routes = [
  {path: '', component: StudentInfoCardComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentInfoCardRoutingModule { }
