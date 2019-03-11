import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-school-setting-dialog',
  templateUrl: './school-setting-dialog.component.html',
  styleUrls: ['./school-setting-dialog.component.scss']
})
export class SchoolSettingDialogComponent implements OnInit {

  schoolForm: FormGroup;

  constructor() { }

  ngOnInit() {
    this.buildForm();
    this.schoolForm.valueChanges.subscribe(res => console.log('FoRM ==>>', res));
  }

  buildForm() {
    this.schoolForm = new FormGroup({
        display_room: new FormControl(true),
        buffer_time: new FormControl(20,
            [Validators.pattern('^[0-9]*?[0-9]+$'), Validators.max(59)])
    });
  }

}
