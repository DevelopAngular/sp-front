import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-school-setting-dialog',
  templateUrl: './school-setting-dialog.component.html',
  styleUrls: ['./school-setting-dialog.component.scss']
})
export class SchoolSettingDialogComponent implements OnInit {

  schoolForm: FormGroup;
  initialState: { display_room: boolean, buffer_time: string | number };
  changeForm: boolean;

  constructor(private dialogRef: MatDialogRef<SchoolSettingDialogComponent>) { }

  ngOnInit() {
    this.buildForm();
    this.initialState = this.schoolForm.value;
    this.schoolForm.valueChanges.subscribe(res => {
      this.changeForm = res.display_room !== this.initialState.display_room || +res.buffer_time !== +this.initialState.buffer_time;
    });
  }

  buildForm() {
    this.schoolForm = new FormGroup({
        display_room: new FormControl(true),
        buffer_time: new FormControl(20,
            [Validators.pattern('^[0-9]*?[0-9]+$'), Validators.max(59), Validators.min(1)])
    });
  }

  save() {

  }

  close() {
    this.dialogRef.close();
  }

}
