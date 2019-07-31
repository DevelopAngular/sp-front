import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';

import { Pinnable } from '../../../models/Pinnable';
import { Location } from '../../../models/Location';
import { LocationsService } from '../../../services/locations.service';
import { RoomData } from '../overlay-data.service';

@Component({
  selector: 'app-bulk-edit-rooms',
  templateUrl: './bulk-edit-rooms.component.html',
  styleUrls: ['./bulk-edit-rooms.component.scss']
})
export class BulkEditRoomsComponent implements OnInit {

  @Input() form: FormGroup;
  selectedRooms: Location[] = [];

  roomData: RoomData;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private locationService: LocationsService,
  ) { }

  ngOnInit() {
    if (this.dialogData['rooms']) {
      this.dialogData['rooms'].forEach((room: Pinnable) => {
        if (room.type === 'category') {
          this.locationService.getLocationsWithCategory(room.category)
            .subscribe((res: Location[]) => {
              this.selectedRooms = [...this.selectedRooms, ...res];
            });
        } else {
          this.selectedRooms.push(room.location);
        }
      });
    }
  }

  roomResult({data, buttonState}) {
    console.log(data);
    console.log(buttonState);
  }

}
