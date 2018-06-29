import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';

import { Observable } from 'rxjs/Observable';
import { DataService } from '../data-service';
import { HttpService } from '../http-service';
import { User } from '../models';

function wrapper<T>(thing: Observable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    thing.subscribe(resolve, reject);
  });
}

@Component({
  selector: 'app-student-search',
  templateUrl: './student-search.component.html',
  styleUrls: ['./student-search.component.scss']
})

export class StudentSearchComponent {
  @Input()
  icon: string;

  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  formCtrl = new FormControl();

  students: User[] = [];
  selectedStudents: User[] = [];

  constructor(private http: HttpService, private dataService: DataService) {

    this.formCtrl.valueChanges.subscribe((students: User[]) => {
      this.selectedStudents = students;
      this.onUpdate.emit(this.selectedStudents);
    });

  }

  async updateStudents(event) {
    const query = event.query;
    this.students = this.convertToStudents(await this.filterStudents(query));
  }

  filterStudents(name: string): Promise<any[]> {
    return this.http.get<any[]>('api/methacton/v1/users?role=hallpass_student&search=' + encodeURI(name)).toPromise();
  }

  convertToStudents(json: any[]): User[] {
    const out: User[] = [];
    for (let i = 0; i < json.length; i++) {
      if (json[i]['rank'] > 0) {
        out.push(new User(json[i]['id'], json[i]['display_name']));
      } else {
        return out;
      }
    }
    return out;
  }

  validate() {
    return this.selectedStudents.length > 0;
  }

  getIcon() {
    return this.validate() ? 'fa-check' : 'fa-close';
  }

  update() {
    this.onUpdate.emit(this.selectedStudents);
  }
}
