import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {User} from '../../../models/User';
import {Location} from '../../../models/Location';
import {fromEvent} from 'rxjs';
import {cloneDeep, isEqual} from 'lodash';

@Component({
  selector: 'app-search-filter-dialog',
  templateUrl: './search-filter-dialog.component.html',
  styleUrls: ['./search-filter-dialog.component.scss']
})
export class SearchFilterDialogComponent implements OnInit {

  @ViewChild('header', { static: true }) header: ElementRef<HTMLDivElement>;
  @ViewChild('rc', { static: false }) set rc(rc: ElementRef<HTMLDivElement> ) {
    if (rc) {
      fromEvent( rc.nativeElement, 'scroll').subscribe((evt: Event) => {
        let blur: number;

        if ((evt.target as HTMLDivElement).scrollTop < 100) {
          blur = 5;
        } else if ((evt.target as HTMLDivElement).scrollTop > 100 && (evt.target as HTMLDivElement).scrollTop < 400) {
          blur = (evt.target as HTMLDivElement).scrollTop / 20;
        } else {
          blur = 20;
        }

        this.header.nativeElement.style.boxShadow = `0 1px ${blur}px 0px rgba(0,0,0,.2)`;
      });
    }
  }

  state: string;
  selectedStudents: User[] = [];
  selectedLocations: Location[] = [];
  roomsWithCategories = [];

  constructor(
      public dialogRef: MatDialogRef<SearchFilterDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      ) { }

  addButtonVisibility(entity: 'students' | 'rooms' | 'withCategories') {
    if (entity === 'students') {
      return !isEqual(this.selectedStudents, this.data['students']);
    }
    if (entity === 'rooms') {
      return !isEqual(this.selectedLocations, this.data['rooms']);
    }
    if (entity === 'withCategories') {
      return !isEqual(this.roomsWithCategories, this.data['withCategories']);
    }
  }

  ngOnInit() {
    this.state = this.data['state'];
    if (this.data['students']) {
      this.selectedStudents = cloneDeep<User[]>(this.data['students']);
    }
    if (this.data['rooms']) {
      this.selectedLocations =  cloneDeep<Location[]>(this.data['rooms']);
    }
    if (this.data['withCategories']) {
        this.roomsWithCategories = cloneDeep<any[]>(this.data['withCategories']);
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
