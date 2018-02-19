import { Component, OnInit, AfterViewInit, ViewChild, Input, SimpleChange } from '@angular/core';
import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

import {HttpClient} from '@angular/common/http';
import { DataService } from '../data-service';

export class Teacher {
  constructor(public id:string, public name: string, public campus:string, public room: string) {

   }

   get nameRoom(){
     return this.name +" | " +this.room;
   }
}


@Component({
  selector: 'app-teacher-search',
  templateUrl: './teacher-search.component.html',
  styleUrls: ['./teacher-search.component.css']
})
export class TeacherSearchComponent implements AfterViewInit {
  teacherCtrl: FormControl;
  filteredTeachers: Observable<any[]>;
  teachers: Teacher[] = [];
  barer: string;
  _value: string = "";
  
  @Input()
  type:string;

  constructor(private http: HttpClient, private dataService:DataService) {
    this.teacherCtrl = new FormControl();
    this.filteredTeachers = this.teacherCtrl.valueChanges
      .pipe(
        startWith(''),
        map(teacher => teacher ? this.filterTeachers(teacher) : this.teachers.slice())
      );
    }

  ngAfterViewInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    //console.log('Barer: ' +this.barer);
    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
    this.http.get('https://notify.letterday.info/api/methacton/v1/locations', config).subscribe((data:any[]) => {
      for(var i = 0; i < data.length; i++){
        this.teachers.push(new Teacher(data[i]["id"], data[i]["name"],data[i]["campus"], data[i]["room"]));
      }
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
      let teacher: Teacher = this.filterTeachers(this.value.slice(0, this.value.indexOf(" |")))[0]
      console.log("Type: " +this.type +" ID: " +teacher.id)
      if(this.type == "'to'")
        this.dataService.updateTo(teacher.id);
      else
        this.dataService.updateFrom(teacher.id);
      }
  }

  // ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
  //   let log: string[] = [];
  //   for (let propName in changes) {
  //     let changedProp = changes[propName];
  //     let to = JSON.stringify(changedProp.currentValue);
  //     if (changedProp.isFirstChange()) {
  //       log.push(`Initial value of ${propName} set to ${to}`);
  //     } else {
  //       let from = JSON.stringify(changedProp.previousValue);
  //       log.push(`${propName} changed from ${from} to ${to}`);
  //     }
  //   }
  //   console.log(log);
  // }

  filterTeachers(name: string) {
    return this.teachers.filter(teacher => teacher.name.toLowerCase().indexOf(name.toLowerCase()) != -1 || teacher.room.toLowerCase().indexOf(name.toLowerCase()) != -1);
  }

}