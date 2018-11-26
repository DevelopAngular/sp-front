import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Pinnable } from '../../models/Pinnable';
import * as _ from 'lodash';

@Component({
  selector: 'app-overlay-container',
  templateUrl: './overlay-container.component.html',
  styleUrls: ['./overlay-container.component.scss']
})
export class OverlayContainerComponent implements OnInit {

  @ViewChild('file') selectedFile;

  selectedRooms: Pinnable[] = [];
  selectedRoomsInFolder: Pinnable[] = [];
  readyRoomsToEdit: Pinnable[] = [];
  pinnables$: Observable<Pinnable[]>;
  overlayType: string;
  roomName: string;
  folderName: string;
  roomNumber: string;
  timeLimit: string;
  travelType: string;
  nowRestriction: string;
  futureRestriction: string;
  iconPicker: string;
  gradientColor: string;
  hideAppearance: boolean = false;
  isEditRooms: boolean = false;

  form: FormGroup;

  buttonsInFolder = [
      { title: 'New Room', icon: './assets/Create (White).png', location: 'newRoomInFolder'},
      { title: 'Import Rooms', icon: null, location: 'importRooms'},
      { title: 'Add Existing', icon: null, location: 'addExisting'}
  ];
  buttonsWithSelectedRooms = [
      { title: 'Bulk Edit Rooms', action: 'edit', color: '#F52B4F, #F37426', width: '120px'},
      { title: 'Remove From Folder', action: 'remove_from_folder', color: '#606981, #ACB4C1', width: '150px'},
      { title: 'Delete Rooms', action: 'delete', color: '#F52B4F, #F37426', width: '120px'}
  ];

  constructor(
      private dialogRef: MatDialogRef<OverlayContainerComponent>,
      @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) { }

  getHeaderData() {
    let colors;
    switch (this.overlayType) {
        case 'newRoom': {
          colors = '#03CF31,#00B476';
          this.roomName = 'New Room';
          break;
        }
        case 'newFolder': {
          colors = '#03CF31,#00B476';
          this.folderName = 'New Folder';
          break;
        }
        case 'edit': {
          colors = '#606981, #ACB4C1';
          this.folderName = 'Bulk Edit Rooms';
          break;
        }
    }
    this.gradientColor = 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  get isValidForm() {
      return !this.requireValidator(this.roomName) && !this.requireValidator(this.roomNumber) && !this.requireValidator(this.timeLimit);
  }

  ngOnInit() {
      this.buildForm();
      this.overlayType = this.dialogData['type'];
      if (this.dialogData['rooms']) {
          this.selectedRooms = this.dialogData['rooms'];
      }

      if (this.dialogData['pinnables$']) {
          this.pinnables$ = this.dialogData['pinnables$'];

          this.pinnables$ = this.pinnables$.pipe(map(pinnables => {
              const pinnablesIds = _.filter(pinnables, {type: 'location'}).map(item => item.id);
              const currentPinnablesIds = this.selectedRooms.map(item => item.id);
              return pinnables.filter(item => {
                  return item.id === _.pullAll(pinnablesIds, currentPinnablesIds).find(id => item.id === id);
              });
          }));
      }

      this.getHeaderData();

      this.form.get('file').valueChanges.subscribe(res => {
          this.setLocation('settingsRooms');
      });
  }

  buildForm() {
    this.form = new FormGroup({
        isEdit: new FormControl(true),
        file: new FormControl()
    });
  }

  setLocation(location) {
    let type;
    let hideAppearance;
    switch (location) {
        case 'newRoomInFolder': {
          this.roomName = 'New Room';
          hideAppearance = true;
          type = 'newRoomInFolder';
          break;
        }
        case 'newFolder': {
          this.selectedRoomsInFolder = [];
          this.readyRoomsToEdit = [];
          this.isEditRooms = false;
          hideAppearance = false;
          type = 'newFolder';
          break;
        }
        case 'importRooms': {
          hideAppearance = true;
          type = 'importRooms';
          break;
        }
        case 'addExisting': {
          hideAppearance = true;
          type = 'addExisting';
          break;
        }
        case 'settingsRooms': {
          hideAppearance = true;
          type = 'settingsRooms';
          break;
        }
    }
    this.hideAppearance = hideAppearance;
    this.overlayType = type;
    return false;
  }

  changeColor(color) {
    this.gradientColor = 'radial-gradient(circle at 98% 97%,' + color.gradientColor + ')';
  }

  addToFolder() {
    this.selectedRooms = _.concat(this.selectedRooms, this.selectedRoomsInFolder);
    this.setLocation('newFolder');
  }

  back() {
    this.dialogRef.close();
  }

  onCancel() {
    this.dialogRef.close();
  }

  done() {
    this.dialogRef.close();
  }

  requireValidator(value) {
    if (!value || value === '' || value === 'New Room' || value === 'New Folder') {
      return true;
    }
    return false;
  }

  selectedRoomsEvent(event, room) {
      if (event.checked) {
          this.readyRoomsToEdit.push(room);
      } else {
          this.readyRoomsToEdit = this.readyRoomsToEdit.filter(readyRoom => readyRoom.id !== room.id);
      }

  }

  onEditRooms(action) {
    if (action === 'edit') {
        this.isEditRooms = true;
        this.setLocation('settingsRooms');
    }
    if (action === 'remove_from_folder') {
        const currentRoomsIds = this.readyRoomsToEdit.map(item => item.id);
        const allSelectedRoomsIds = this.selectedRooms.map(item => item.id);
        this.selectedRooms = this.selectedRooms.filter(item => {
            return item.id === _.pullAll(allSelectedRoomsIds, currentRoomsIds).find(id => item.id === id);
        });
        this.readyRoomsToEdit = [];
     }
    if (action === 'delete') {
        this.deleteRoom();
    }
  }

    deleteRoom() {
      // Delete Request
    }
}
