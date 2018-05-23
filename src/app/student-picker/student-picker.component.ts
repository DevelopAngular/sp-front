import { Component, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Paged, User } from '../NewModels';
import { Subject } from 'rxjs/Subject';
import { HttpService } from '../http-service';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-student-picker',
  templateUrl: './student-picker.component.html',
  styleUrls: ['./student-picker.component.css']
})
export class StudentPickerComponent implements OnDestroy {

  @Input()
  formCtrl: FormControl;

  @Input()
  multiple = false;

  public studentsFilterCtrl: FormControl = new FormControl();

  public filteredStudents: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);

  private _onDestroy = new Subject<any>();

  constructor(private http: HttpService) {
    this.filteredStudents.next([]);

    this.studentsFilterCtrl.valueChanges
      .takeUntil(this._onDestroy)
      .switchMap(query => {
        if (query !== '') {
          return this.http.get<Paged<any>>('api/methacton/v1/users?role=hallpass_student&limit=10&search=' + encodeURI(query))
            .map(json => json.results);
        } else {
          return Observable.of([]);
        }
      })
      .map((json: any[]) => {
        const users = json.map(raw => User.fromJSON(raw));

        const selectedUsers = this.multiple ? this.formCtrl.value : (this.formCtrl.value ? [this.formCtrl.value] : null);
        if (selectedUsers) {
          outer: for (const selectedUser of selectedUsers) {
            for (let i = 0; i < users.length; i++) {
              if (users[i].id === selectedUser.id) {
                users[i] = selectedUser;
                continue outer;
              }
            }

            users.push(selectedUser);
          }
        }

        return users;
      })
      .subscribe(this.filteredStudents);
  }

  ngOnDestroy() {
    this._onDestroy.next(null);
    this._onDestroy.complete();
  }

}
