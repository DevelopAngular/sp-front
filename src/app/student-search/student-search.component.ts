import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { MapsAPILoader } from '@agm/core';




import { User } from '../models/User';
import {BehaviorSubject, of, pipe, Subject} from 'rxjs';
import {UserService} from '../services/user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpService} from '../services/http-service';
import {HttpClient} from '@angular/common/http';
import {combineLatest, filter, map, mergeMap, startWith, tap} from 'rxjs/operators';
import {constructUrl} from '../live-data/helpers';

declare const window;
export type SearchEntity = 'schools' | 'users';

@Component({
  selector: 'app-student-search',
  templateUrl: './student-search.component.html',
  styleUrls: ['./student-search.component.scss']
})

export class StudentSearchComponent implements OnInit {


  @Input() searchTarget: SearchEntity = 'users';

  @Input() disabled: boolean = false;
  @Input() focused: boolean = false;
  @Input() showOptions: boolean = true;
  @Input() selectedStudents: User[] = [];
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


  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  @ViewChild('studentInput') input;

  private placePredictionService;
  private currentPosition;

  query = new BehaviorSubject<any[]>(null);
  schools: BehaviorSubject<any[]> = new BehaviorSubject(null);
  selectedSchool;

  pending$: Subject<boolean> = new Subject();
  students: Promise<any[]>;
  inputValue$: Subject<string> = new Subject<string>();
  showDummy: boolean = false;
  hoveredIndex: number;
  hovered: boolean;
  pressed: boolean;

  constructor(
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private mapsApi: MapsAPILoader,

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
        // .pipe(
          // filter(schools => !!schools)
        // )
        .subscribe(
          (v1: any[]) => {
            console.log(v1);

            this.schools.next(v1);
            this.pending$.next(false);
            this.showDummy = v1 && !v1.length;
            // .then(schools => {
            // this.pending$.next(false);
            // this.showDummy = !schools.length;
            //
            // return schools.filter(school => school.types.includes('school'));
            // });
          })

    }
  }

  onSearch(search: string) {

    switch (this.searchTarget) {
      case 'users':
          if (search !== '') {
            if (this.type === 'alternative') {
              this.students = this.userService.searchProfile(this.role, 50, search)
                .toPromise()
                .then((paged: any) => {
                  // console.log('PAGED RESULT >>>', paged);
                  this.showDummy = !paged.results.length;
                  return this.removeDuplicateStudents(paged.results);
                });
            } else if (this.type === 'gsuite') {
              this.pending$.next(true);
              this.students = this.userService.searchProfileAll(search, this.type, this.role.split('_')[this.role.split('_').length - 1])
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
          // let predictionsAll = [];
          // let pointer = 0;
          // const keyWords = ['', 'school',  'elementary', 'elementary school', 'high', 'high school'];
          //   keyWords.forEach((kw: string, index) => {
                  this.placePredictionService.getPlacePredictions({
                    location: this.currentPosition,
                    // input: search + ' ' + kw,
                    input: search,
                    radius: 100000,
                    types: ['establishment']
                  }, (predictions, status) => {
                    // pointer += index;

                    // if (predictions) {
                    //   predictionsAll = predictionsAll.concat(predictions.filter(school => school.types.includes('school')));
                    // }
                    // if (pointer === 15) {
                    //   this.query.next(predictionsAll);
                    this.query.next(predictions ? predictions : []);
                    // }
                  });
                // });

        } else {
          // debugger

          this.query.next(null);
          this.showDummy = false;
          this.inputValue$.next('');
          this.pending$.next(false);

        }
          break;
    }
  }
  selectSchool(school) {
    this.selectedSchool = school;
    this.onUpdate.emit(school);
    this.schools = null;
  }
  onBlur(event) {
    // console.log(event);
    // this.students = null;
  }
  removeStudent(student: User) {
    const index = this.selectedStudents.indexOf(student, 0);
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
