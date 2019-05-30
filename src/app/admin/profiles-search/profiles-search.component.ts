import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {UserService} from '../../services/user.service';
import {User} from '../../models/User';

@Component({
  selector: 'app-profiles-search',
  templateUrl: './profiles-search.component.html',
  styleUrls: ['./profiles-search.component.scss']
})
export class ProfilesSearchComponent implements OnInit {

  @Input() role: string;
  @Input() placeholder: string = 'Search profiles';
  @Input() focused: boolean = true;
  @Input() width: string = '400px';
  @Input() type: string = 'alternative'; // Can be alternative or gsuite, endpoint will depend on that.

  private destroy$: Subject<any> = new Subject();
  private searchChangeObserver$: Subject<string>;
  public inputValue$: Subject<string> = new Subject<string>();


  public userList: any[] = [];
  public wait: boolean;

  @Output() result: EventEmitter<{wait: boolean, userList: any[]}> = new EventEmitter();
  @Output() isEmitUsers: EventEmitter<boolean> = new EventEmitter();

  //
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();
  @Input() showOptions: boolean = true;
  @Input() selectedStudents: User[] = [];


  students: Promise<any[]>;
  inputValue: string = '';
  //
  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {

  }
  showSearchParam(searchValue) {

    if (!this.searchChangeObserver$) {

      Observable.create(observer => {
        this.searchChangeObserver$ = observer;
      })
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value: string) => this.userService.getUsersList(this.role, value))
      )
      .subscribe((userList) => {
        if (userList && userList.length) {
          // this.wait = false;
          // this.userList = userList.map((raw) => {
          //   return {
          //     'Name': raw.display_name,
          //     'Account Email': raw.primary_email,
          //     'Last Sign-in': raw.last_updated,
          //     'Restrictions': 'None'
          //   };
          // });
          this.result.emit({
            wait: false,
            userList: userList
          });
        } else {
          this.result.emit({
            wait: false,
            userList: []
          });
        }
      });
    }
    this.searchChangeObserver$.next(searchValue);
  }
  onSearch(search: string) {
    this.isEmitUsers.emit(false);
    if (search !== '') {
      this.students = this.userService.searchProfileAll(search, this.type)
          .toPromise().then((users: User[]) => {
            console.log(users);
            if (users.length > 0) {
              this.isEmitUsers.emit(true);
              return this.removeDuplicateStudents(users);
            }
          });
    } else {
      this.students = null;
      this.inputValue = '';
    }
  }

  removeStudent(student: User) {
    const index = this.selectedStudents.indexOf(student, 0);
    if (index > -1) {
      this.selectedStudents.splice(index, 1);
    }
    this.onUpdate.emit(this.selectedStudents);
    this.onSearch('');
  }

  addStudent(student: User) {
    console.log(student);
    this.isEmitUsers.emit(false);
    this.inputValue = '';
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
