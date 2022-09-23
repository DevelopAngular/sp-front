import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyRoomRoutingModule } from './my-room-routing.module';
import { MyRoomComponent } from './my-room.component';
import { SharedModule } from '../shared/shared.module';
import { RoomCheckinCodeDialogComponent } from './room-checkin-code-dialog/room-checkin-code-dialog.component';

@NgModule({
  declarations: [
    MyRoomComponent,
    RoomCheckinCodeDialogComponent
  ],
  imports: [
    CommonModule,
    MyRoomRoutingModule,
    SharedModule
  ]
})
export class MyRoomModule { }
