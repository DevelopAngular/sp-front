import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';

import { HttpService } from '../services/http-service';
import { Paged } from '../models';
import { User } from '../models/User';
import {Subject} from 'rxjs';
import {ApiService} from '../services/api.service';

@Component({
  selector: 'app-student-search',
  templateUrl: './student-search.component.html',
  styleUrls: ['./student-search.component.scss']
})

export class StudentSearchComponent implements AfterViewInit {

  @Input() disabled: boolean = false;
  @Input() focused: boolean = false;
  @Input() showOptions: boolean = true;
  @Input() selectedStudents: User[] = [];
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  @ViewChild('studentInput') input;

  students: Promise<any[]>;
  inputValue$: Subject<string> = new Subject<string>();

  constructor(private apiService: ApiService) {
    // this.onSearch('');
  }

  ngAfterViewInit() {
    // this.input.nativeElement.focus();
    if (this.selectedStudents.length) {
      setTimeout(() => {
        this.focused = true;
      }, 50);
    }

  }

  onSearch(search: string) {
    if (search !== '') {
      this.students = this.apiService.searchProfile('hallpass_student',5, encodeURI(search))
          .toPromise().then(paged => this.removeDuplicateStudents(paged.results));
    } else {
      this.students = null;
      this.inputValue$.next('');
    }
  }

  removeStudent(student: User) {
    var index = this.selectedStudents.indexOf(student, 0);
    if (index > -1) {
      this.selectedStudents.splice(index, 1);
    }
    this.onUpdate.emit(this.selectedStudents);
    this.onSearch('');
  }

  addStudent(student: User) {
    console.log(student);
    this.inputValue$.next('');
    this.onSearch('');
    if (!this.selectedStudents.includes(student)) {
      this.selectedStudents.push(student);
      this.onUpdate.emit(this.selectedStudents);
    }
  }

  removeDuplicateStudents(students): User[] {
    let fixedStudents: User[] = students;
    let studentsToRemove: User[] = [];
    for (let selectedStudent of this.selectedStudents) {
      for (let student of fixedStudents) {
        if (selectedStudent.id === student.id) {
          studentsToRemove.push(student);
        }
      }
    }

    for (let studentToRemove of studentsToRemove) {
      var index = fixedStudents.indexOf(studentToRemove, 0);
      if (index > -1) {
        fixedStudents.splice(index, 1);
      }
    }

    return fixedStudents;
  }
}
