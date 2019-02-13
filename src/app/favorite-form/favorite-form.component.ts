import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '../models/Location';
import { MatDialogRef } from '@angular/material';
import { LocationsService } from '../services/locations.service';

@Component({
  selector: 'app-favorite-form',
  templateUrl: './favorite-form.component.html',
  styleUrls: ['./favorite-form.component.scss']
})
export class FavoriteFormComponent implements OnInit, OnDestroy {

  starChanges: any[] = [];

  constructor(
      private dialogRef: MatDialogRef<FavoriteFormComponent>,
      private locationService: LocationsService
  ) { }

  ngOnInit() {
      this.locationService.getFavoriteLocations().toPromise().then((stars:any[]) => {
        this.starChanges = stars.map(val => Location.fromJSON(val));
      });

    this.dialogRef.updatePosition({top: '120px'});
  }

  ngOnDestroy() {
    this.dialogRef.close(this.starChanges.map(loc => loc.id));
  }

  closeDialog(){
    // const body = {'locations': this.starChanges.map(loc => loc.id)};
    // console.log(body.locations);
    // this.apiService.updateFavoriteLocations(body).subscribe();
  }

  onStar(loc: any){
    console.log(loc.starred, this.starChanges)
    if(loc.starred)
      this.addLoc(loc, this.starChanges);
    else
      this.removeLoc(loc, this.starChanges);
    console.log(this.starChanges)
  }

  addLoc(loc: any, array: any[]){
    if(!array.includes(loc))
      array.push(loc)
  }

  removeLoc(loc: any, array: any[]){
    var index = array.findIndex((element) => element.id === loc.id);
    if (index > -1) {
      console.log('removeinf')
      array.splice(index, 1);
    }
  }

  back() {
    this.dialogRef.close(this.starChanges.map(loc => loc.id));
  }

}
