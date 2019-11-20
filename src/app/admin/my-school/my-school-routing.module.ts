import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MySchoolComponent } from './my-school.component';

const routes: Routes = [
  { path: '', component: MySchoolComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MySchoolRoutingModule { }
