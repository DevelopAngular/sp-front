import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { User } from '../models/User';
import {BehaviorSubject, of, pipe, Subject} from 'rxjs';
import {UserService} from '../services/user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {AdminService} from '../services/admin.service';
import {HttpService} from '../services/http-service';
import {School} from '../models/School';
import {map, switchMap} from 'rxjs/operators';

import * as _ from 'lodash';

declare const window;

export type SearchEntity = 'schools' | 'users' | 'orgunits' | 'local';

export type selectorIndicator = '+' | '-';

export type UnitId = 'admin' | 'teacher' | 'assistant' | 'student';

export class GSuiteSelector {

  public path: string;
  private applicationIndicator: boolean = false;
  private readonly customSelector: boolean = false;

  constructor (
    path: string,
  ) {

    const indicator = path[0];

    if (indicator === '+') {
      this.applicationIndicator = true;
      this.path = path.slice(1);
    } else if (indicator === '-') {
      this.applicationIndicator = false;
      this.path = path.slice(1);
    } else {
      this.customSelector = true;
      this.path = 'Custom selector applied';
    }

  }

  private ai(flag) {
    if (!this.customSelector) {
      this.applicationIndicator = flag;
    }
  }

  get as() {
    if (this.customSelector) {
     return this.path;
    } else {
      return (this.applicationIndicator ? '+' : '-').concat(this.path);
    }
  }

  updateAplicatinIndicator(arg: boolean) {
    this.ai(arg);
  }


}

// export interface OrgUnit {
//   unitId: UnitId;
//   title: string;
//   selector: GSuiteSelector[];
//   selected: boolean;
// }

export class OrgUnit {

  unitId: UnitId;
  title: string;
  selector: GSuiteSelector[];
  selected: boolean;

  constructor (
    unitId: UnitId,
    title: string,
    selector: GSuiteSelector[],
    selected: boolean
  ) {
    this.unitId = unitId;
    this.title = title;
    this.selector = selector;
    this.selected = selected;
  }
}


@Component({
  selector: 'app-sp-search',
  templateUrl: './sp-search.component.html',
  styleUrls: ['./sp-search.component.scss']
})

export class SPSearchComponent implements OnInit {


  @Input() searchTarget: SearchEntity = 'users';

  @Input() disabled: boolean = false;
  @Input() focused: boolean = false;
  @Input() showOptions: boolean = true;
  @Input() selectedOptions: Array<User | School | GSuiteSelector> = [];
  @Input() selectedOrgUnits: any[] = [];
  @Input() height: string = '40px';
  @Input() width: string = '280px';
  @Input() list: boolean = true;
  @Input() listMaxHeight: string = '210px';

  @Input() preventRemovingLast: boolean = false;
  @Input() emitSingleProfile: boolean = false;
  @Input() chipsMode: boolean = false;
  @Input() inputField: boolean = true;
  @Input() cancelButton: boolean = false;
  @Input() rollUpAfterSelection: boolean = true;
  @Input() role: string = '_profile_student';
  @Input() dummyRoleText: string = 'students';
  @Input() placeholder: string = 'Search students';
  @Input() type: string = 'alternative'; // Can be alternative or gsuite, endpoint will depend on that.

  @Input() searchingTeachers: User[];


  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  @ViewChild('studentInput') input;

  private placePredictionService;
  private currentPosition;

  query = new BehaviorSubject<any[]>(null);
  schools: BehaviorSubject<any[]> = new BehaviorSubject(null);
  selectedSchool;
  orgunitsCollection: GSuiteSelector[];
  orgunits: BehaviorSubject<any[]> = new BehaviorSubject(null);
  teacherCollection$: BehaviorSubject<User[]> = new BehaviorSubject<User[]>(null);

  pending$: Subject<boolean> = new Subject();
  students: Promise<any[]>;
  inputValue$: Subject<string> = new Subject<string>();
  showDummy: boolean = false;
  hovered: boolean;
  pressed: boolean;

  constructor(
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private httpService: HttpService,
    private http: HttpClient,
    private mapsApi: MapsAPILoader,
  ) {


  }

  private getEmitedValue() {
    if (this.emitSingleProfile)  {
      return this.selectedOptions[0];
    } else {
      return this.selectedOptions;
    }
  }

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

    const selfRef = this;

    if (this.searchTarget === 'schools') {
      this.mapsApi.load().then((resource) => {
        selfRef.currentPosition =  new window.google.maps.LatLng({
          lat: 	40.730610,
          lng: -73.935242
        });
        this.placePredictionService = new window.google.maps.places.AutocompleteService();
      });

      this.query
        .subscribe(
          (v1: any[]) => {
            // console.log(v1);

            this.schools.next(v1);
            this.pending$.next(false);
            this.showDummy = v1 && !v1.length;
          });
    } else if (this.searchTarget === 'orgunits') {
      this.httpService.currentSchool$.pipe(
        map((school: School) => {
          return `${school.id}`;
        }),
        switchMap((schoolId: string) => {
          return this.httpService.get(`v1/schools/${schoolId}/gsuite/org_units`);

        }),
        map((gss: any[]) => {
          return gss
            // .filter((gs) => gs.path.search(search) !== -1)
            .map((gs: {path: string}) => new GSuiteSelector('+' + gs.path));
        })
      )
      .subscribe((res: GSuiteSelector[]) => {
        // console.log(res);
        this.orgunitsCollection = <GSuiteSelector[]>this.removeDuplicateStudents(res);
        this.showDummy = !this.removeDuplicateStudents(res).length;
        this.orgunits.next(this.removeDuplicateStudents(res));
      });
    }
  }

  onSearch(search: string) {
// debugger
    switch (this.searchTarget) {
      case 'users':
          if (search !== '') {
            this.pending$.next(true);

            if (this.type === 'alternative') {
              this.students = this.userService.searchProfile(this.role, 50, search)
                .toPromise()
                .then((paged: any) => {
                  this.pending$.next(false);
                  this.showDummy = !paged.results.length;
                  return this.removeDuplicateStudents(paged.results);
                });
            } else if (this.type === 'gsuite') {
              let request$;
              if (this.role !== '_all') {
                request$ = this.userService.searchProfileAll(search, this.type, this.role.split('_')[this.role.split('_').length - 1]);
              } else {
                  request$ = this.userService.searchProfileAll(search, this.type);
              }
              this.students = request$
                .toPromise().then((users: User[]) => {
                  this.pending$.next(false);
                  this.showDummy = !users.length;
                  return this.removeDuplicateStudents(users);
                });
            }

          } else {

            this.students = this.rollUpAfterSelection ? null : of([]).toPromise();
            this.showDummy = false;
            this.inputValue$.next('');
          }
        break;
      case 'schools':

        if (search !== '') {

          this.pending$.next(true);
                  this.placePredictionService.getPlacePredictions({
                    location: this.currentPosition,
                    input: search,
                    radius: 100000,
                    types: ['establishment']
                  }, (predictions, status) => {
                    this.query.next(predictions ? predictions : []);
                  });

        } else {

          this.query.next(null);
          this.showDummy = false;
          this.inputValue$.next('');
          this.pending$.next(false);

        }
          break;
      case 'orgunits':

        if (search !== '') {
          const regexp = new RegExp(search, 'i');
          const res = this.orgunitsCollection.filter((gs) => gs.path.search(regexp) !== -1 );
          this.orgunits.next(this.removeDuplicateStudents(res));

        } else {
          this.showDummy = false;
          this.inputValue$.next('');
          this.pending$.next(false);
          this.orgunits.next(null);
        }
        break;

      case 'local':
        if (search !== '') {
          const filterItems = _.filter(this.searchingTeachers, (item => {
            return (item.display_name).toLowerCase().includes(search);
            }));
          this.teacherCollection$.next(filterItems);
        } else {
          this.showDummy = false;
          this.inputValue$.next('');
          this.pending$.next(false);
          this.teacherCollection$.next(null);
        }

    }
  }
  selectSchool(school) {
    this.selectedSchool = school;
    this.onUpdate.emit(school);
    this.schools.next(null);
  }

  addUnit(unit) {
    this.selectedOptions.push(unit);
    this.orgunits.next(null);
    this.onUpdate.emit(this.selectedOptions);
  }

  addLocalTeacher(teacher) {
    this.teacherCollection$.next(null);
    this.onUpdate.emit(teacher);
  }

  onBlur(event) {
    // console.log(event);
    // this.students = null;
  }

  addStudent(student: User) {
    console.log(student);
    if (this.chipsMode) {
      this.inputField = false;
    }
    this.students = of([]).toPromise();
    this.inputValue$.next('');
    this.onSearch('');
    if (!this.selectedOptions.includes(student)) {
      this.selectedOptions.push(student);
      this.onUpdate.emit(this.getEmitedValue());
    }
  }

  removeDuplicateStudents(students: User[] | GSuiteSelector[]): User[] | GSuiteSelector[] {
    if (!students.length) {
      return [];
    }
    if (students[0] instanceof User || this.searchTarget === 'users') {
      let fixedStudents: User[] = <User[]>students;
      let studentsToRemove: User[] = [];
      for (let selectedStudent of <Array<User>>this.selectedOptions) {
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
    if (students[0] instanceof GSuiteSelector || this.searchTarget === 'orgunits') {
      return (<GSuiteSelector[]>students).filter((gs: GSuiteSelector) => {
        if ( this.selectedOptions.findIndex((_gs: GSuiteSelector) => _gs.path === gs.path) === -1) {
          return gs;
        }
      });

    }
  }
  cancel(studentInput) {
    studentInput.input.nativeElement.value = '';
    studentInput.input.nativeElement.focus();
    this.students = null;
    this.inputField = false;
    this.onUpdate.emit(this.getEmitedValue());
  }
}
