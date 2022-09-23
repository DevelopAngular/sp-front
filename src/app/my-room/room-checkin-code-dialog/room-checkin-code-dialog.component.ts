import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-room-checkin-code-dialog',
  templateUrl: './room-checkin-code-dialog.component.html',
  styleUrls: ['./room-checkin-code-dialog.component.scss']
})
export class RoomCheckinCodeDialogComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  get gradient() {
    return 'radial-gradient(circle at 73% 71%, "#13BF9E,#00D99B")';
  }

}
