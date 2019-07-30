import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { merge, Subject, zip } from 'rxjs';

import { Location } from '../../../models/Location';
import { Pinnable } from '../../../models/Pinnable';
import { LocationsService } from '../../../services/locations.service';
import { OverlayContainerComponent } from '../overlay-container.component';
import { HallPassesService } from '../../../services/hall-passes.service';
import { FolderData, OverlayDataService, Pages } from '../overlay-data.service';
import { CreateFormService } from '../../../create-hallpass-forms/create-form.service';

import * as _ from 'lodash';
import {OptionState} from '../advanced-options/advanced-options.component';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {

  @Input() form: FormGroup;

  @Output() folderDataResult: EventEmitter<FolderData> = new EventEmitter<FolderData>();

  currentPage: number;

  pinnable: Pinnable;

  advOptState: OptionState = {
    now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
    future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } }
  };

  roomsImFolder: Location[] = [];
  selectedRooms = [];
  selectedRoomToEdit;

  folderName: string = '';

  buttonsInFolder = [
    { title: 'New Room', icon: './assets/Plus (White).svg', page: Pages.NewRoomInFolder },
    { title: 'Import Rooms', icon: null, page: Pages.ImportRooms },
    { title: 'Add Existing', icon: null, page: Pages.AddExistingRooms }
  ];

  buttonsWithSelectedRooms = [
    { title: 'Bulk Edit Rooms', action: Pages.BulkEditRoomsInFolder, color: '#FFFFFF, #FFFFFF', textColor: '#1F195E', hover: '#FFFFFF'},
    { title: 'Delete Rooms', action: 'delete', textColor: '#FFFFFF', color: '#DA2370,#FB434A', hover: '#DA2370'}
  ];

  folderRoomsLoaded: boolean;

  change$: Subject<any> = new Subject<any>();

  constructor(
      @Inject(MAT_DIALOG_DATA) public dialogData: any,
      public overlayService: OverlayDataService,
      private dialogRef: MatDialogRef<OverlayContainerComponent>,
      private hallPassService: HallPassesService,
      private locationService: LocationsService,
      private sanitizer: DomSanitizer,
      private formService: CreateFormService,
  ) { }

  get sortSelectedRooms() {
      return _.sortBy(this.roomsImFolder, (res) => res.title.toLowerCase());
  }

  ngOnInit() {
    this.currentPage = this.overlayService.pageState.getValue().currentPage;
    const data = this.overlayService.pageState.getValue().data;

    if (data) {
        if (data.roomsInFolderLoaded) {
            this.folderName = data.folderName;
            this.roomsImFolder = data.roomsInFolder;
            this.folderRoomsLoaded = true;
        } else {
            this.pinnable = data.pinnable;
            this.folderName = this.pinnable.title;
            this.locationService.getLocationsWithCategory(this.pinnable.category)
                .subscribe((res: Location[]) => {
                    this.roomsImFolder = res;
                    this.folderRoomsLoaded = true;
                    // if (this.dialogData['forceSelectedLocation']) {
                    //     this.setToEditRoom(this.dialogData['forceSelectedLocation']);
                    // }
                });
        }
    } else {
        this.folderRoomsLoaded = true;
    }

    merge(this.form.get('folderName').valueChanges, this.change$)
        .subscribe(() => {
            this.folderDataResult.emit({
                folderName: this.form.get('folderName').value === '' ? 'New Folder' : this.form.get('folderName').value,
                roomsInFolder: this.roomsImFolder,
                selectedRoomsInFolder: this.selectedRooms,
                roomsInFolderLoaded: true,
                selectedRoomToEdit: this.selectedRoomToEdit
            });
        });
  }

  stickyButtonClick(page) {
      this.formService.setFrameMotionDirection('forward');
      setTimeout(() => {
          if (page === 'delete') {
              console.log('DELETE');
          } else {
              this.overlayService.changePage(page, this.currentPage, {
                  selectedRoomsInFolder: this.selectedRooms
              });
          }
          this.change$.next();
      }, 50);
  }

  isSelected(room) {
      return this.selectedRooms.find((item) => {
          return room.id === item.id;
      });
  }

  setToEditRoom(room) {
      this.selectedRoomToEdit = room;
      this.generateAdvOptionsModel(room);
      this.change$.next();
      this.overlayService.changePage(Pages.EditRoomInFolder, this.currentPage, {
          advancedOptions: this.advOptState,
          selectedRoomsInFolder: [room]
      });
  }

  selectedRoomsEvent(event, room, all?: boolean) {
      this.formService.setFrameMotionDirection('forward');
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

  deleteRoom() {
    const pinnable = this.overlayService.pageState.getValue().data.pinnable;
    const deletions = [
        this.hallPassService.deletePinnable(pinnable.id)
    ];

    if (pinnable.location) {
        deletions.push(this.locationService.deleteLocation(pinnable.location.id));
    }

    zip(...deletions).subscribe(res => {
        this.dialogRef.close();
    });
  }

    generateAdvOptionsModel(loc: Location) {
        if (loc.request_mode === 'teacher_in_room' || loc.request_mode === 'all_teachers_in_room') {

            const mode = loc.request_mode === 'teacher_in_room' ? 'any_teach_assign' : 'all_teach_assign';

            if (loc.request_send_destination_teachers && loc.request_send_origin_teachers) {
                this.advOptState.now.data[mode] = 'Both';
            } else if (loc.request_send_destination_teachers) {
                this.advOptState.now.data[mode] = 'This Room';
            } else if (loc.request_send_origin_teachers) {
                this.advOptState.now.data[mode] = 'Origin';
            }
        } else if (loc.request_mode === 'specific_teachers') {
            this.advOptState.now.data.selectedTeachers = loc.request_teachers;
        }
        if (loc.scheduling_request_mode === 'teacher_in_room' || loc.scheduling_request_mode === 'all_teachers_in_room') {

            const mode = loc.scheduling_request_mode === 'teacher_in_room' ? 'any_teach_assign' : 'all_teach_assign';

            if (loc.scheduling_request_send_destination_teachers && loc.scheduling_request_send_origin_teachers) {
                this.advOptState.future.data[mode] = 'Both';
            } else if (loc.scheduling_request_send_destination_teachers) {
                this.advOptState.future.data[mode] = 'This Room';
            } else if (loc.scheduling_request_send_origin_teachers) {
                this.advOptState.future.data[mode] = 'Origin';
            }
        } else if (loc.scheduling_request_mode === 'specific_teachers') {
            this.advOptState.future.data.selectedTeachers = loc.scheduling_request_teachers;
        }

        if (loc.request_mode === 'any_teacher') {
            this.advOptState.now.state = 'Any teacher (default)';
        } else if (loc.request_mode === 'teacher_in_room') {
            this.advOptState.now.state = 'Any teachers assigned';
        } else if (loc.request_mode === 'all_teachers_in_room') {
            this.advOptState.now.state = 'All teachers assigned';
        } else if (loc.request_mode === 'specific_teachers') {
            this.advOptState.now.state = 'Certain \n teacher(s)';
        }
        if (loc.scheduling_request_mode === 'any_teacher') {
            this.advOptState.future.state = 'Any teacher (default)';
        } else if (loc.scheduling_request_mode === 'teacher_in_room') {
            this.advOptState.future.state = 'Any teachers assigned';
        } else if (loc.scheduling_request_mode === 'all_teachers_in_room') {
            this.advOptState.future.state = 'All teachers assigned';
        } else if (loc.scheduling_request_mode === 'specific_teachers') {
            this.advOptState.future.state = 'Certain \n teacher(s)';
        }
        return this.advOptState;
    }

}
