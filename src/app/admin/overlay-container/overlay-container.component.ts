import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { Pinnable } from '../../models/Pinnable';

@Component({
  selector: 'app-overlay-container',
  templateUrl: './overlay-container.component.html',
  styleUrls: ['./overlay-container.component.scss']
})
export class OverlayContainerComponent implements OnInit {

  rooms: Pinnable[];
  overlayType: string;
  roomName: string;
  roomNumber: string;
  timeLimit: string;
  travelType: string;
  nowRestriction: string;
  futureRestriction: string;
  colorPicker: string;
  iconPicker: string;
  input_label: string;
  gradientColor: string;

  form: FormGroup;

  buttonsInFolder = [
      { title: 'New Room', icon: './assets/Create (White).png', location: 'newRoom'},
      { title: 'Import Rooms', icon: null, location: 'importRooms'},
      { title: 'Add Existing', icon: null, location: 'addExisting'}
  ];

  constructor(
      private dialogRef: MatDialogRef<OverlayContainerComponent>,
      @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) { }

  getHeaderData() {
    let colors;
    let text;
    let input_label;
    switch (this.overlayType) {
        case 'newRoom': {
          colors = '#03CF31,#00B476';
          text = 'New Room';
          input_label = 'Room';
          break;
        }
        case 'newFolder': {
          colors = '#03CF31,#00B476';
          text = 'New Folder';
          input_label = 'Folder';
          break;
        }
    }
    this.gradientColor = 'radial-gradient(circle at 98% 97%,' + colors + ')';
    this.input_label = input_label;
    this.roomName = text;
  }

  ngOnInit() {
      this.buildForm();
      this.rooms = this.dialogData['rooms'];
      this.overlayType = this.dialogData['type'];
      this.getHeaderData();
  }

  buildForm() {
    this.form = new FormGroup({
        isEdit: new FormControl(true)
    });
  }

  setLocation(location) {
    switch (location) {
        case 'newRoom': {
          return this.overlayType = 'newRoom';
        }
        case 'newFolder': {
          return this.overlayType = 'newFolder';
        }
        case 'importRooms': {
          return this.overlayType = 'importRooms';
        }
        case 'addExisting': {
          return this.overlayType = 'addExisting';
        }
    }
  }

  back() {
    this.dialogRef.close();
  }

  onCancel() {
    this.dialogRef.close();
  }

  roomNameValidator() {
    if (!this.roomName || this.roomName === '' || this.roomName === 'New Room' || this.roomName === 'New Folder') {
      return true;
    }
    return false;
  }
}
