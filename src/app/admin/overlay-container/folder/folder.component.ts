import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { FolderData, OverlayDataService } from '../overlay-data.service';
import { OverlayContainerComponent } from '../overlay-container.component';
import { HallPassesService } from '../../../services/hall-passes.service';
import { Location } from '../../../models/Location';
import { LocationsService } from '../../../services/locations.service';
import {Pinnable} from '../../../models/Pinnable';
import * as _ from 'lodash';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {

  @Input() form: FormGroup;

  currentPage: number;

  pinnable: Pinnable;

  roomsImFolder: Location[] = [];
  selectedRooms = []

  folderData: FolderData = {
    folderName: '',
  };

  folderRoomsLoaded: boolean;

  constructor(
      @Inject(MAT_DIALOG_DATA) public dialogData: any,
      public overlayService: OverlayDataService,
      private dialogRef: MatDialogRef<OverlayContainerComponent>,
      private hallPassService: HallPassesService,
      private locationService: LocationsService,
      private sanitizer: DomSanitizer,
  ) { }

  get sortSelectedRooms() {
      return _.sortBy(this.roomsImFolder, (res) => res.title.toLowerCase());
  }

  ngOnInit() {
    this.currentPage = this.overlayService.pageState.getValue().currentPage;

    if (this.overlayService.pageState.getValue().data) {
      this.pinnable = this.overlayService.pageState.getValue().data.pinnable;
        this.folderData = {
            folderName: this.pinnable.title
        };
        this.locationService.getLocationsWithCategory(this.pinnable.category)
            .subscribe((res: Location[]) => {
              this.roomsImFolder = res;
              this.folderRoomsLoaded = true;
                // this.folderRoomsLoaded = true;
                // this.selectedRooms = res;
                // if (this.dialogData['forceSelectedLocation']) {
                //     this.setToEditRoom(this.dialogData['forceSelectedLocation']);
                // }
                console.log('My Data ===>>>>', this.folderData);
            });
    }
  }

  isSelected(room) {
      return this.roomsImFolder.find((item) => {
          return room.id === item.id;
      });
  }

  selectedRoomsEvent(event, room, all?: boolean) {

      // this.formService.setFrameMotionDirection('forward');
      setTimeout(() => {
          if (all) {
              if (event.checked) {
                  this.selectedRooms = this.roomsImFolder;
              } else {
                  this.selectedRooms = [];
              }
          } else if (event.checked) {
              this.selectedRooms.push(room);
          } else {
              this.selectedRooms = this.selectedRooms.filter(readyRoom => readyRoom.id !== room.id);
          }
      }, 100);
  }

  textColor(item) {
      if (item.hovered) {
          return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      } else {
          return this.sanitizer.bypassSecurityTrustStyle('#555558');
      }
  }

  getBackgroundColor(item) {
      if (item.hovered) {
          if (item.pressed) {
              return '#E2E7F4';
          } else {
              return '#ECF1FF';
          }
      } else {
          return '#FFFFFF';
      }
  }

}
