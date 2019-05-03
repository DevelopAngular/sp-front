import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';



import { User } from '../models/User';
import {of, Subject} from 'rxjs';
import {UserService} from '../services/user.service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-student-search',
  templateUrl: './student-search.component.html',
  styleUrls: ['./student-search.component.scss']
})

export class StudentSearchComponent implements OnInit {

  @Input() disabled: boolean = false;
  @Input() focused: boolean = false;
  @Input() showOptions: boolean = true;
  @Input() selectedStudents: User[] = [];
  @Input() width: string = '280px';
  @Input() list: boolean = true;
  @Input() listMaxHeight: string = '210px';


  @Input() emitSingleProfile: boolean = false;
  @Input() chipsMode: boolean = false;
  @Input() inputField: boolean = true;
  @Input() cancelButton: boolean = false;
  @Input() rollUpAfterSelection: boolean = true;
  @Input() role: string = '_profile_student';
  @Input() placeholder: string = 'Search students';
  @Input() type: string = 'alternative'; // Can be alternative or gsuite, endpoint will depend on that.


  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  @ViewChild('studentInput') input;

  students: Promise<any[]>;
  inputValue$: Subject<string> = new Subject<string>();
  showDummy: boolean = false;
  hoveredIndex: number;
  hovered: boolean;
  pressed: boolean;

  constructor(
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {

  }

  private getEmitedValue() {
    if (this.emitSingleProfile)  {
      return this.selectedStudents[0];
    } else {
      return this.selectedStudents;
    }
  }

  // bgColor(i){
  //     if (this.hovered && this.hoveredIndex === i) {
  //       if (this.pressed) {
  //         return this.sanitizer.bypassSecurityTrustStyle('#E2E7F4');
  //       } else {
  //         return this.sanitizer.bypassSecurityTrustStyle('#ECF1FF');
  //       }
  //     } else {
  //       return this.sanitizer.bypassSecurityTrustStyle('#FFFFFF');
  //     }
  // }
  //
  // textColor(i) {
  //     if (this.hovered && this.hoveredIndex === i) {
  //       return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
  //     } else {
  //       return this.sanitizer.bypassSecurityTrustStyle('#555558');
  //     }
  // }

  textColor(item) {
    if (item.hovered) {
      return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
    } else {
      return this.sanitizer.bypassSecurityTrustStyle('#555558');
    }
  }

  getBackground(item) {
    if (item.hovered) {
      if (item.pressed) {
        return '#E2E7F4';
      } else {
        return '#ECF1FF';
      }
    } else {
      return '#FFFFFF';
    }
  }

  ngOnInit() {
    if (this.chipsMode) {
      this.inputField = false;
    }
    // this.input.nativeElement.focus();
    // if (this.selectedStudents.length) {
    //   setTimeout(() => {
    //     this.focused = true;
    //   }, 50);
    // }

  }

  onSearch(search: string) {
    if (search !== '') {
      if (this.type === 'alternative') {
        this.students = this.userService.searchProfile(this.role, 50, encodeURI(search))
          .toPromise()
          .then((paged: any) => {
            console.log('PAGED RESULT >>>', paged);
            this.showDummy = paged.results.length ? false : true;
            return this.removeDuplicateStudents(paged.results);
          });
      } else if ('gsuite'){
        this.students = this.userService.searchProfileAll(encodeURI(search), this.type)
          .toPromise().then((users: User[]) => {
            console.log(users);
            if (users.length > 0) {
              // this.isEmitUsers.emit(true);
              return this.removeDuplicateStudents(users);
            }
          });
      }

    } else {

      this.students = this.rollUpAfterSelection ? null : of([]).toPromise();
      this.showDummy = false;
      this.inputValue$.next('');
    }
  }
  onBlur(event) {
    // console.log(event);
    // this.students = null;
  }
  removeStudent(student: User) {
    var index = this.selectedStudents.indexOf(student, 0);
    if (index > -1) {
      this.selectedStudents.splice(index, 1);
    }
    this.onUpdate.emit(this.getEmitedValue());
    this.onSearch('');
  }

  addStudent(student: User) {
    console.log(student);
    if (this.chipsMode) {
      this.inputField = false;
    }
    this.input.focus();
    this.students = of([]).toPromise();
    this.inputValue$.next('');
    this.onSearch('');
    if (!this.selectedStudents.includes(student)) {
      this.selectedStudents.push(student);
      this.onUpdate.emit(this.getEmitedValue());
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
  cancel(studentInput) {
    studentInput.input.nativeElement.value = '';
    studentInput.input.nativeElement.focus();
    this.students = null;
    this.inputField = false;
    this.onUpdate.emit(this.getEmitedValue());
  }
}
