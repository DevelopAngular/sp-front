import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

import {HttpClient} from '@angular/common/http';

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
export class TeacherSearchComponent implements OnInit {
  teacherCtrl: FormControl;
  filteredTeachers: Observable<any[]>;

  teachers: Teacher[] = [];

  constructor(private http: HttpClient) {
    this.teacherCtrl = new FormControl();
    this.filteredTeachers = this.teacherCtrl.valueChanges
      .pipe(
        startWith(''),
        map(teacher => teacher ? this.filterTeachers(teacher) : this.teachers.slice())
      );
    }

  ngOnInit() {
    var config = {headers:{'Authorization' : 'Bearer SGFg1c4sLRqSIJFn3mJJWf2Tvz6ykP'}}
    this.http.get('https://notify.letterday.info/api/methacton/v1/locations', config).subscribe((data:any[]) => {
      for(var i = 0; i < data.length; i++){
        this.teachers.push(new Teacher(data[i]["id"], data[i]["name"],data[i]["campus"], data[i]["room"]));
      }
    });
  }
  filterTeachers(name: string) {
    return this.teachers.filter(teacher => teacher.name.toLowerCase().indexOf(name.toLowerCase()) != -1 || teacher.room.toLowerCase().indexOf(name.toLowerCase()) != -1);
  }

}
