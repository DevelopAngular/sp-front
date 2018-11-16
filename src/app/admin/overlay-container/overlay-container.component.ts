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
  title: string;
  input_lable: string;
  gradientColor: string;
  form: FormGroup;

  constructor(
      private dialogRef: MatDialogRef<OverlayContainerComponent>,
      @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) { }

  getHeaderData() {
    let colors;
    let text;
    let input_lable;
    switch (this.overlayType) {
        case 'newRoom': {
          colors = '#03CF31,#00B476';
          text = 'New Room';
          input_lable = 'Room';
          break;
        }
        case 'newFolder': {
          colors = '#03CF31,#00B476';
          text = 'New Folder';
          input_lable = 'Folder';
          break;
        }
    }
    this.gradientColor = 'radial-gradient(circle at 98% 97%,' + colors + ')';
    this.input_lable = input_lable;
    this.title = text;
  }

  getChoiceTravel(emit) {
    console.log(emit);
  }

  getChoiceColor(emit) {
    console.log(emit);
  }

  getChoiceIcon(emit) {
    console.log(emit);
  }

  ngOnInit() {
      this.buildForm();
      this.rooms = this.dialogData['rooms'];
      this.overlayType = this.dialogData['type'];
      this.getHeaderData();
      console.log('!!!!', this.rooms);
  }

  buildForm() {
    this.form = new FormGroup({
        isEdit: new FormControl(true)
    });
  }

  onCancel() {
    this.dialogRef.close();
  }







}
