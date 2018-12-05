import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {debounceTime, distinctUntilChanged, filter, map, switchMap} from 'rxjs/internal/operators';
import {Observable, Subject} from 'rxjs';
import {UserService} from '../../user.service';
import {Paged} from '../../models';
import {User} from '../../models/User';
import {HttpService} from '../../http-service';

@Component({
  selector: 'app-profiles-search',
  templateUrl: './profiles-search.component.html',
  styleUrls: ['./profiles-search.component.scss']
})
export class ProfilesSearchComponent implements OnInit {

  @Input() role: string;
  @Input() placeholder: string = 'Search profiles';

  private destroy$: Subject<any> = new Subject();
  private searchChangeObserver$: Subject<string>;

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
    private http: HttpService
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
    if(search!=='')
      this.students = this.http.get<Paged<any>>('v1/users?role=' + this.role + '&limit=5' + (search === '' ? '' : '&search=' + encodeURI(search)))
          .toPromise().then(paged => {
            if (paged.results.length > 0) {
              this.isEmitUsers.emit(true);
              return  this.removeDuplicateStudents(paged.results);
            }
          });
    else
      this.students = null;
    this.inputValue = '';
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
