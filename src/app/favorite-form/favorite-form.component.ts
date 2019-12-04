import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '../models/Location';
import { MatDialogRef } from '@angular/material';
import { LocationsService } from '../services/locations.service';
import { DeviceDetection } from '../device-detection.helper';
import {DragulaService} from 'ng2-dragula';
import {merge, Observable, of, Subject, timer} from 'rxjs';
import { mapTo, skipUntil } from 'rxjs/operators';

@Component({
  selector: 'app-favorite-form',
  templateUrl: './favorite-form.component.html',
  styleUrls: ['./favorite-form.component.scss']
})
export class FavoriteFormComponent implements OnInit, OnDestroy {

  starChanges: any[] = [];
  starChangesIds: number[];
  overflow$: Observable<string>;

  constructor(
      private dialogRef: MatDialogRef<FavoriteFormComponent>,
      private locationService: LocationsService,
      private dragulaService: DragulaService
  ) { }

  ngOnInit() {
    this.overflow$ = merge(
      of('auto'),
      this.dragulaService.drag('locations').pipe(mapTo('hidden')),
      this.dragulaService.drop('locations').pipe(mapTo('auto'))
    ).pipe(skipUntil(timer(50)));

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
