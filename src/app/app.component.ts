import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

import {HttpClient} from '@angular/common/http';

export class Teacher {
  constructor(public name: string, public room: string) {

   }

   get nameRoom(){
     return this.name +" | " +this.room;
   }
}

/**
 * @title Autocomplete overview
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  teacherCtrl: FormControl;
  filteredTeachers: Observable<any[]>;
  durs: string[] = ["5","10","15","30"]

  teachers: Teacher[] = [
    new Teacher('Kyle Cook','A149'),
    new Teacher('Ananth Dandibhotla','A238'),
    new Teacher('Will Gulian','A327'),
    new Teacher('Dhruv Sringari','A416'),
    new Teacher('Sand Man','B145'),
    new Teacher('Crummy Wizard','B236'),
    new Teacher('Dan Bontempo','B327'),
    new Teacher('Donald Sawyer','B418'),
    new Teacher('Kevin Metz','C149'),
    new Teacher('Jill Palmer','C230'),
    new Teacher('Nat Ryan','C126'),
    new Teacher('Matt Ryan','C417')
  ];

public now: Date = new Date();
public dateNow: any;
public timeNow: any;

  constructor(private http: HttpClient) {
    this.teacherCtrl = new FormControl();
    this.filteredTeachers = this.teacherCtrl.valueChanges
      .pipe(
        startWith(''),
        map(teacher => teacher ? this.filterTeachers(teacher) : this.teachers.slice())
      );

      setInterval(() => {
        var nowish = new Date();
        this.dateNow = nowish.getMonth() + "/" +nowish.getDay() +"/" +nowish.getFullYear();
        var mins = nowish.getMinutes();
        this.timeNow = nowish.getHours() +":" +((mins<10)?"0":"") +mins;
      }, 100);
      
  }

  ngOnInit(){
      // Make the HTTP request:
    //this.http.get('https://notify.letterday.info/api/methacton/v1/locations?campus=""').subscribe(data => {
      // Read the result field from the JSON response.
    //this.teachers = data['results'];
    //});
  }

  filterTeachers(name: string) {
    return this.teachers.filter(teacher => teacher.name.toLowerCase().indexOf(name.toLowerCase()) != -1 || teacher.room.toLowerCase().indexOf(name.toLowerCase()) != -1);
    //return this.states.filter(state => state.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

}