import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-teacher-pin',
  templateUrl: './teacher-pin.component.html',
  styleUrls: ['./teacher-pin.component.scss']
})
export class TeacherPinComponent implements OnInit {

  form: FormGroup;

  constructor() { }

  ngOnInit() {
    this.form = new FormGroup({
      pin: new FormControl()
    });
  }

}
