import { Component, OnInit, AfterViewInit, ViewChild, Input, SimpleChange } from '@angular/core';
import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import {map} from 'rxjs/operators/map';
import {mergeMap} from 'rxjs/operators/mergeMap';

import { DataService } from '../data-service';
import { HttpService } from '../http-service';

export class Student {
  constructor(public id:string, public name: string) {

  }
}

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

  studentCtrl: FormControl;
  filteredStudents: Observable<any[]>;
  students: Student[] = [];
  barer: string;
  _value: string = "";

  constructor(private http: HttpService, private dataService:DataService) {
    this.studentCtrl = new FormControl();
    this.filteredStudents = this.studentCtrl.valueChanges
      .pipe(
        startWith(''),
        mergeMap(student => student ? Observable.fromPromise((async () => {
          
          const students = await this.filterStudents(student)

          const convStudents = this.convertToStudents(students);
          
          return convStudents;
        })()) : Observable.of(this.students.slice()))
      );
  }

  ngAfterViewInit() {
    //-= TODO =- disable and re-enable when locations are beign gotten and received.
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    //console.log('Barer: ' +this.barer);
    console.log("Getting locations");
    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}};
    this.http.get('api/methacton/v1/users?is_staff=false', config).subscribe((data:any) => {
      for(var i = 0; i < data.length; i++){
        this.students.push(new Student(data[i]["id"], data[i]["display_name"]));
      }
      console.log("Done getting Students.");
      //console.log(this.teachers);
    });
  }

  get value(): string {
    return this._value;
  }

  set value(v: string) {
    this._value = v;
    //console.log("Value: " +v)
    //Use DataService to update list of selected students.
  }

  async filterStudents(name: string): Promise<any[]> {
      let out:any[] = [];
      var config = {headers:{'Authorization' : 'Bearer ' +this.barer}};
      const data = await this.http.get<any[]>('api/methacton/v1/users?is_staff=false&search=' +encodeURI(name), config).toPromise();
      return data;
     
  }

  convertToStudents(json:any[]): Student[] {
    let out:Student[] = [];
    for(var i = 0; i < json.length; i++){
      if(json[i]['rank'] > 0){
        out.push(new Student(json[i]['id'], json[i]['display_name']))
      } else{
        return out;
      }
      return out;
    }
    //return json.map(item => new Student(item["id"], item["display_name"]));
  }

}