import { Component, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { of ,  ReplaySubject ,  Subject } from 'rxjs';
import { HttpService } from '../services/http-service';
import { User } from '../models/User';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-student-picker',
  templateUrl: './student-picker.component.html',
  styleUrls: ['./student-picker.component.scss']
})
export class StudentPickerComponent implements OnDestroy {

  @Input()
  formCtrl: FormControl;

  @Input()
  multiple = false;

  public studentsFilterCtrl: FormControl = new FormControl();

  public filteredStudents: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);

  private _onDestroy = new Subject<any>();

  constructor(
      private http: HttpService,
      private userService: UserService
  ) {
    this.filteredStudents.next([]);

    this.studentsFilterCtrl.valueChanges.pipe(
      takeUntil(this._onDestroy),
        switchMap(query => {
        if (query !== '') {
          return this.userService.searchProfile('hallpass_student', 10, encodeURI(query))
            .pipe(
              map(json => json.results)
            );
        } else {
          return of([]);
        }
      }),
        map((json: any[]) => {
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
      }))
      .subscribe(this.filteredStudents);
  }

  ngOnDestroy() {
    this._onDestroy.next(null);
    this._onDestroy.complete();
  }

}
