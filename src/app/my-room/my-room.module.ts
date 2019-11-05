import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyRoomRoutingModule } from './my-room-routing.module';
import { MyRoomComponent } from './my-room.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    MyRoomComponent
  ],
  imports: [
    CommonModule,
    MyRoomRoutingModule,
    SharedModule
  ]
})
export class MyRoomModule { }
