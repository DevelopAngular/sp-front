import { Component, EventEmitter, Input, Output } from '@angular/core';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';

import { HttpService } from '../http-service';
import { User, Paged } from '../NewModels';
import { element } from '../../../node_modules/protractor';

@Component({
  selector: 'app-student-search',
  templateUrl: './student-search.component.html',
  styleUrls: ['./student-search.component.scss']
})

export class StudentSearchComponent {
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();
  @Input() showOptions: boolean = true;
  
  students: Promise<any[]>;
  selectedStudents: User[] = [];
  inputValue: string = '';

  constructor(private http: HttpService) {
    this.onSearch('');
  }

  onSearch(search: string) {
    this.students = this.http.get<Paged<any>>('api/methacton/v1/users?role=hallpass_student&limit=5' +(search===''?'':'&search=' + encodeURI(search))).toPromise().then(paged => this.removeDuplicateStudents(paged.results));
    console.log(this.students);
  }

  removeStudent(student: User){
    var index = this.selectedStudents.indexOf(student, 0);
    if (index > -1) {
      this.selectedStudents.splice(index, 1);
    }
    this.onUpdate.emit(this.selectedStudents);
    this.onSearch('');
  }

  addStudent(student: User){
    console.log(student);
    this.inputValue = '';
    this.onSearch('');
    if(!this.selectedStudents.includes(student)){
      this.selectedStudents.push(student);
      this.onUpdate.emit(this.selectedStudents);
    }
  }

  removeDuplicateStudents(students): User[]{
    let fixedStudents: User[] = students;
    let studentsToRemove: User[] = [];
    for(let selectedStudent of this.selectedStudents){
      for(let student of fixedStudents){
        if(selectedStudent.id === student.id){
          studentsToRemove.push(student);
        }
      }
    }

    for(let studentToRemove of studentsToRemove){
      var index = fixedStudents.indexOf(studentToRemove, 0);
      if (index > -1) {
        fixedStudents.splice(index, 1);
      }
    }

    return fixedStudents;
  }
}
