import { Component, OnInit, AfterViewInit, ViewChild, Input, SimpleChange } from '@angular/core';
import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

import {HttpClient} from '@angular/common/http';
import { DataService } from '../data-service';

export class Student {
  constructor(public id:string, public name: string, public sId:string) {

  }

  get namesId(){
    return this.name +" | " +this.sId;
  }
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
  baseURL = "https://notify-messenger-notify-server-staging.lavanote.com/api/methacton/v1/";

  constructor(private http: HttpClient, private dataService:DataService) {
    this.studentCtrl = new FormControl();
    this.filteredStudents = this.studentCtrl.valueChanges
      .pipe(
        startWith(''),
        map(student => student ? this.filterStudents(student) : this.students.slice())
      );
    }

  ngAfterViewInit() {
    //-= TODO =- disable and re-enable when locations are beign gotten and received.
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    //console.log('Barer: ' +this.barer);
    console.log("Getting locations");
    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
    this.http.get(this.baseURL +'locations', config).subscribe((data:any[]) => {
      for(var i = 0; i < data.length; i++){
        this.students.push(new Student(data[i]["id"], data[i]["name"], data[i]["campus"]));
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
    //console.log("Type: " +this.type +" Value: " +v)
    if(v.indexOf("|") != -1){
      let student: Student = this.filterStudents(this.value.slice(0, this.value.indexOf(" |")))[0]
    }
      //Use DataService to update list of selected students.
  }

  filterStudents(name: string) {
    return this.students.filter(student => student.name.toLowerCase().indexOf(name.toLowerCase()) != -1 || student.sId.toLowerCase().indexOf(name.toLowerCase()) != -1);
  }

}
