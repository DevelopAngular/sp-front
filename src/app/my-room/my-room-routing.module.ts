import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyRoomComponent } from './my-room.component';

const routes: Routes = [
  { path: '', component: MyRoomComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyRoomRoutingModule { }
