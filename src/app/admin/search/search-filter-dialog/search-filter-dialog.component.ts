import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { User } from '../../../models/User';
import { Location } from '../../../models/Location';
import * as _ from 'lodash';

@Component({
  selector: 'app-search-filter-dialog',
  templateUrl: './search-filter-dialog.component.html',
  styleUrls: ['./search-filter-dialog.component.scss']
})
export class SearchFilterDialogComponent implements OnInit {

  state: string;

  selectedStudents: User[] = [];
  selectedLocations: Location[] = [];
  roomsWithCategories;

  constructor(
      public dialogRef: MatDialogRef<SearchFilterDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      ) { }

  ngOnInit() {
    this.state = this.data['state'];
    if (this.data['students']) {
      this.selectedStudents = this.data['students'];
    }
  }

  addLocations({locations, rooms}) {
    this.selectedLocations = locations;
    this.roomsWithCategories = rooms;
  }

  add() {
    this.dialogRef.close({action: 'rooms', locations: this.selectedLocations });
  }

  addStudents() {
    this.dialogRef.close({action: 'students', students: this.selectedStudents});
  }

}
