import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {GSuiteSettingsComponent} from '../g-suite-settings.component';

@Component({
  selector: 'app-g-suite-info',
  templateUrl: './g-suite-info.component.html',
  styleUrls: ['./g-suite-info.component.scss']
})
export class GSuiteInfoComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<GSuiteSettingsComponent>) { }

  ngOnInit() {
  }

}
