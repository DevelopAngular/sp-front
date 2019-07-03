import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { User } from '../../../models/User';
import { Location } from '../../../models/Location';
import {fromEvent} from 'rxjs';

@Component({
  selector: 'app-search-filter-dialog',
  templateUrl: './search-filter-dialog.component.html',
  styleUrls: ['./search-filter-dialog.component.scss']
})
export class SearchFilterDialogComponent implements OnInit {

  @ViewChild('header') header: ElementRef<HTMLDivElement>;
  @ViewChild('rc') set rc(rc: ElementRef<HTMLDivElement> ) {
    fromEvent( rc.nativeElement, 'scroll').subscribe((evt: Event) => {
      if ((evt.target as HTMLDivElement).scrollTop > 430) {
        this.header.nativeElement.style.boxShadow = '0 1px 35px 10px rgba(0,0,0,.2)';
      } else {
        this.header.nativeElement.style.boxShadow = '0 1px 5px 0px rgba(0,0,0,.2)';
      }
    });
  }

  state: string;

  selectedStudents: User[] = [];
  selectedLocations: Location[] = [];
  roomsWithCategories = [];

  constructor(
      public dialogRef: MatDialogRef<SearchFilterDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      ) { }

  ngOnInit() {
    this.state = this.data['state'];
    if (this.data['students']) {
      this.selectedStudents = this.data['students'];
    }
    if (this.data['rooms']) {
      this.selectedLocations = this.data['rooms'];
    }
    if (this.data['withCategories']) {
        this.roomsWithCategories = this.data['withCategories'];
    }
  }

  addLocations({locations, rooms}) {
    this.selectedLocations = locations;
    this.roomsWithCategories = rooms;
  }

  add() {
    this.dialogRef.close({action: 'rooms', locations: this.selectedLocations, allSelected: this.roomsWithCategories});
  }

  addRoomFilter(filter, room) {
    if (room.locations) {
      room.locations.forEach(loc => {
        loc.filter = filter;
      });
    } else {
        room.filter = filter;
    }
  }

  addStudents() {
    this.dialogRef.close({action: 'students', students: this.selectedStudents});
  }
}
