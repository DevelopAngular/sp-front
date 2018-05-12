import { Component, OnInit, AfterViewInit, ViewChild, Input, SimpleChange, Output, EventEmitter } from '@angular/core';
import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

import { DataService } from '../data-service';
import { HttpService } from '../http-service';

import {Location} from '../NewModels';

@Component({
  selector: 'app-teacher-search',
  templateUrl: './teacher-search.component.html',
  styleUrls: ['./teacher-search.component.css']
})
export class TeacherSearchComponent implements AfterViewInit {
  locations: Location[] = [];
  _selectedLocation: Location;
  barer: string;

  @Input()
  type:string;
  public typeString:string = "";

  @Output()
  locationSelectedEvent: EventEmitter<Location> = new EventEmitter();

  constructor(private http: HttpService, private dataService:DataService) {}

  ngAfterViewInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    this.typeString = this.type=="'to'"?"Destination":"Origin";
  }

  set selectedLocation(loc:Location){
    this._selectedLocation = loc;
    this.locationSelectedEvent.emit(loc);
  }

  async updateLocations(event){
    const query = event.query;
    this.locations = this.convertToLocations(await this.filterLocations(query));
  }

  async filterLocations(name: string): Promise<any[]> {
      const config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
      const data = await this.http.get<any[]>('api/methacton/v1/locations?search=' + encodeURI(name), config).toPromise();
      return data;
  }

  convertToLocations(json: any[]): Location[] {
    const out: Location[] = [];
    for (let i = 0; i < json.length; i++){
      out.push(Location.fromJSON(json[i]));
    }
    return out;
  }
  validate(){
    return this.selectedLocation instanceof Location; //TODO && not the same as other
  }

  getIcon(){
    return this.validate() ? 'fa-check' : 'fa-close';
  }
}
