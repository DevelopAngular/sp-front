import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '../models/Location';
import { MatDialogRef } from '@angular/material';
import { LocationsService } from '../services/locations.service';
import { DeviceDetection } from '../device-detection.helper';

@Component({
  selector: 'app-favorite-form',
  templateUrl: './favorite-form.component.html',
  styleUrls: ['./favorite-form.component.scss']
})
export class FavoriteFormComponent implements OnInit, OnDestroy {

  starChanges: any[] = [];
  starChangesIds: number[];

  constructor(
      private dialogRef: MatDialogRef<FavoriteFormComponent>,
      private locationService: LocationsService
  ) { }

  ngOnInit() {
      this.locationService.getFavoriteLocationsRequest().subscribe((stars: any[]) => {
        this.starChanges = stars.map(val => Location.fromJSON(val));
        this.starChangesIds = stars.map(star => star.id);
      });

  }

  ngOnDestroy() {
    this.dialogRef.close(this.starChangesIds);
  }

  onStar(loc: any) {
    // debugger;
    if (loc.starred) {
      this.addLoc(loc, this.starChanges);
    } else {
      this.removeLoc(loc, this.starChanges);
    }
  }

  addLoc(loc: any, array: any[]) {
    if(!array.includes(loc))
      array.push(loc);
      this.starChangesIds.push(loc.id);
  }

  removeLoc(loc: any, array: any[]) {
    var index = array.findIndex((element) => element.id === loc.id);
    if (index > -1) {
      array.splice(index, 1);
      this.starChangesIds.splice(index, 1);
    }
  }

  back() {
    this.ngOnDestroy();
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }
}
