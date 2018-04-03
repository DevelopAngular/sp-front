import { Component, OnInit, AfterViewInit, ViewChild, Input, SimpleChange, Injectable } from '@angular/core';
import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import {map, filter} from 'rxjs/operators';
import {mergeMap} from 'rxjs/operators/mergeMap';
import { of } from 'rxjs/observable/of';
import { Response } from '@angular/http';
import { DataService } from '../data-service';
import { HttpService } from '../http-service';
import {User} from '../models';

function wrapper<T>(thing: Observable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    thing.subscribe(resolve, reject);
  });
}

@Component({
  selector: 'app-student-search',
  templateUrl: './student-search.component.html',
  styleUrls: ['./student-search.component.css']
})

export class StudentSearchComponent implements AfterViewInit {
  @Input()
  icon: string;

  students: User[] = [];
  selectedStudents: User[] = [];
  barer: string;

  constructor(private http: HttpService, private dataService: DataService) {}

  ngAfterViewInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
  }

  async updateStudents(event){
    const query = event.query;
    this.students = this.convertToStudents(await this.filterStudents(query));
  }

  async filterStudents(name: string): Promise<any[]> {
      const config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
      const data = await this.http.get<any[]>('api/methacton/v1/users?is_staff=false&search=' + encodeURI(name), config).toPromise();
      return data;
  }

  convertToStudents(json: any[]): User[] {
    const out: User[] = [];
    for (let i = 0; i < json.length; i++){
      if (json[i]['rank'] > 0){
        out.push(new User(json[i]['id'], json[i]['display_name']));
      } else{
        return out;
      }
    }
    return out;
  }

  validate(){
    return this.selectedStudents.length > 0;
  }

  getIcon(){
    return this.validate() ? 'fa-check' : 'fa-close';
  }
}
