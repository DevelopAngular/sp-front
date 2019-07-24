import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OverlayDataService, RoomData } from '../overlay-data.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  @Input() form: FormGroup;

  data: RoomData;

  currentPage: number;
  tooltipText;
  roomData = {
      selectedTeachers: [],
      travelType: [],
      restricted: null,
      scheduling_restricted: null
  };

  constructor(public overlayService: OverlayDataService) {
  }

  ngOnInit() {
      this.tooltipText = this.overlayService.tooltipText;
      this.currentPage = this.overlayService.pageState.currentPage;
  }

  selectTeacherEvent(teachers) {
    this.roomData.selectedTeachers = teachers;
    debugger;
    this.overlayService.changePage(2, 1);
  }

}
