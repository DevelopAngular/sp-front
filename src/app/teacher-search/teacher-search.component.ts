import { Component, OnInit, AfterViewInit, ViewChild, Input, SimpleChange } from '@angular/core';
import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

import { DataService } from '../data-service';
import { HttpService } from '../http-service';

import {Location} from '../models';

@Component({
  selector: 'app-teacher-search',
  templateUrl: './teacher-search.component.html',
  styleUrls: ['./teacher-search.component.css']
})
export class TeacherSearchComponent implements AfterViewInit {
  locations: Location[] = [];
  selectedLocation: Location;
  barer: string;

  @Input()
  type:string;

  constructor(private http: HttpService, private dataService:DataService) {}

  ngAfterViewInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
  }

  async updateLocations(event){
    let query = event.query;
    this.locations = this.convertToLocations(await this.filterLocations(query));
  }

  async filterLocations(name: string): Promise<any[]> {
      var config = {headers:{'Authorization' : 'Bearer ' +this.barer}};
      const data = await this.http.get<any[]>('api/methacton/v1/locations?search=' +encodeURI(name), config).toPromise();
      return data;
  }

  convertToLocations(json:any[]): Location[] {
    let out:Location[] = [];
    for(var i = 0; i < json.length; i++){
      out.push(new Location(json[i]['id'], json[i]['name'], json[i]['campus'], json[i]['room']))
    }
    return out;
  }
  validate(){
    return this.selectedLocation instanceof Location;
  }

  getIcon(){
    return this.validate()?"fa-check":"fa-close";
  }
}
