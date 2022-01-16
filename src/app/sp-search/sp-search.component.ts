import {Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {MapsAPILoader} from '@agm/core';
import {User} from '../models/User';
import {BehaviorSubject, interval, Observable, of, Subject} from 'rxjs';
import {UserService} from '../services/user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpService} from '../services/http-service';
import {School} from '../models/School';
import {filter, map, pluck, switchMap, take, takeUntil} from 'rxjs/operators';
import {filter as _filter} from 'lodash';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';
import {ScreenService} from '../services/screen.service';
import {LocationsService} from '../services/locations.service';
import {Location} from '../models/Location';
import {DeviceDetection} from '../device-detection.helper';
import {DomCheckerService} from '../services/dom-checker.service';
import {Overlay} from '@angular/cdk/overlay';
import {KioskModeService} from '../services/kiosk-mode.service';

declare const window;

export type SearchEntity = 'schools' | 'users' | 'orgunits' | 'local' | 'roles' | 'rooms';

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

export class SPSearchComponent implements OnInit, OnDestroy {


  @Input() searchTarget: SearchEntity = 'users';

  @Input() disabled: boolean = false;
  @Input() focused: boolean = true;
  @Input() showOptions: boolean = true;
  @Input() selectedOptions: Array<User | School | GSuiteSelector | {id: number, role: string, icon: string}[] | Location> = [];
  @Input() selectedOrgUnits: any[] = [];
  @Input() height: string = '40px';
  @Input() width: string = '280px';
  @Input() list: boolean = true;
  @Input() listMaxHeight: string = '210px';

  @Input() preventRemovingLast: boolean = false;
  @Input() emitSingleProfile: boolean = false;
  @Input() chipsMode: boolean = false;
  @Input() inputField: boolean = true;
  @Input() overrideChipsInputField: boolean = false;
  @Input() cancelButton: boolean = false;
  @Input() rollUpAfterSelection: boolean = true;
  @Input() role: string = '_profile_student';
  @Input() gSuiteRoles: string[];
  @Input() dummyRoleText: string = 'students';
  @Input() placeholder: string = 'Search students';
  @Input() type: string = 'alternative'; // Can be alternative or G_Suite or GG4L, endpoint will depend on that.
  @Input() isProposed: boolean;
  @Input() proposedSearchString: string;
  @Input() displaySelectedTitle: boolean = true;
  @Input() showStudentInfo: boolean = true;

  @Input() searchingTeachers: User[];
  @Input() searchingRoles: { id: number, role: string, icon: string }[];

  @Output() onUpdate: EventEmitter<any> = new EventEmitter();
  @Output() blurEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isOpenedOptions: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('studentInput') input: ElementRef;
  @ViewChild('wrapper') wrapper: ElementRef;
  @ViewChild('cell') cell: ElementRef;
  @ViewChild('studentPasses') studentPasses: ElementRef;

  private placePredictionService;
  private currentPosition;

  query = new BehaviorSubject<any[]>(null);
  schools: BehaviorSubject<any[]> = new BehaviorSubject(null);
  selectedSchool;
  orgunitsCollection: GSuiteSelector[];
  orgunits: BehaviorSubject<any[]> = new BehaviorSubject(null);
  teacherCollection$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  pending$: Subject<boolean> = new Subject();
  students: Promise<any[]>;
  inputValue$: Subject<string> = new Subject<string>();
  showDummy: boolean = false;
  hovered: boolean;
  pressed: boolean;

  searchCount: number;
  firstSearchItem: User | GSuiteSelector;
  currentSchool: School;
  suggestedTeacher: User;
  foundLocations: Location[] = [];
  forceFocused$: Subject<boolean> = new Subject<boolean>();

  isOpenTooltip: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  destroyAnimation$: Subject<any> = new Subject<any>();
  showBackgroundOverlay: boolean;
  destroyOpen$ = new Subject();
  disableClose$ = new Subject();
  overlayScrollStrategy;

  user$: Observable<User>;
  isEnableProfilePictures$: Observable<boolean>;

  destroy$: Subject<any> = new Subject<any>();

  @HostListener('document.scroll', ['$event'])
  scroll() {
    this.destroyOpen$.next();
    this.showBackgroundOverlay = false;
  }

  constructor(
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private httpService: HttpService,
    private mapsApi: MapsAPILoader,
    private shortcutsService: KeyboardShortcutsService,
    private renderer: Renderer2,
    public screenService: ScreenService,
    private locationService: LocationsService,
    private domCheckerService: DomCheckerService,
    public overlay: Overlay,
    private kioskMode: KioskModeService
  ) {}

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  get isKioskMode() {
    return this.kioskMode.currentRoom$.getValue();
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

  changeColor(value, elem) {
    if (value.hovered) {
      if (value.pressed) {
        this.renderer.setStyle(elem.target, 'background-color', '#ECEDF1');
      } else {
        this.renderer.setStyle(elem.target, 'background-color', '#F1F2F4');
      }
    } else {
      this.renderer.setStyle(elem.target, 'background-color', '#FFFFFF');
    }
  }

  ngOnInit() {
    this.overlayScrollStrategy = this.overlay.scrollStrategies.close();
    if (this.chipsMode && !this.overrideChipsInputField) {
      this.inputField = false;
    }
    this.currentSchool = this.httpService.getSchool();

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
            .map((gs: {path: string}) => new GSuiteSelector('+' + gs.path));
        })
      )
      .subscribe((res: GSuiteSelector[]) => {
        this.orgunitsCollection = <GSuiteSelector[]>this.removeDuplicateStudents(res);
        this.showDummy = !this.removeDuplicateStudents(res).length;
        this.orgunits.next(this.removeDuplicateStudents(res));
      });
    }

    if (this.isProposed) {
      this.userService.searchProfile('_profile_teacher', 1, this.proposedSearchString)
        .subscribe(res => {
          this.suggestedTeacher = res.results[0];
          if (this.suggestedTeacher && (this.selectedOptions as any[]).find(t => t.id === this.suggestedTeacher.id)) {
            this.isProposed = false;
          }
        });
    }

    this.shortcutsService.onPressKeyEvent$
      .pipe(
        filter(() => !this.isMobile),
        takeUntil(this.destroy$),
        pluck('key')
      )
      .subscribe(key => {
        if (key[0] === 'enter') {
          if (this.searchCount === 1) {
            (this.cell.nativeElement as HTMLElement).click();
          }
          const element = document.activeElement;
          (element as HTMLElement).click();
        }
      });

    this.user$ = this.userService.user$;
    this.isEnableProfilePictures$ = this.userService.isEnableProfilePictures$;
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(search: string) {
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
                  this.isOpenedOptions.emit(true);
                  return this.removeDuplicateStudents(paged.results);
                });
            } else if (this.type === 'G Suite' || this.type === 'GG4L') {
              let request$;
              if (this.role !== '_all') {
                if (this.type === 'G Suite') {
                  request$ = this.userService.searchProfileAll(search, this.type, this.role.split('_')[this.role.split('_').length - 1], this.gSuiteRoles);
                } else {
                  request$ = this.userService.searchProfileAll(search, this.type, this.role.split('_')[this.role.split('_').length - 1]);
                }
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
          if (search.length >= 4) {
            this.pending$.next(true);
            this.placePredictionService.getPlacePredictions({
              location: this.currentPosition,
              input: search,
              radius: 100000,
              types: ['establishment']
            }, (predictions, status) => {
              this.query.next(predictions ? predictions : []);
            });
          }
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
          const filterItems: User[] = _filter(this.searchingTeachers, (item => {
            return (item.display_name).toLowerCase().includes(search);
            }));
          this.teacherCollection$.next(this.removeDuplicateStudents(filterItems));
        } else {
          this.showDummy = false;
          this.inputValue$.next('');
          this.pending$.next(false);
          this.teacherCollection$.next(null);
        }
        break;
      case 'rooms':
        if (search !== '') {
          this.pending$.next(true);
          const url = `&search=${search}&starred=false`;
          this.locationService.searchLocations(100, url)
            .subscribe((locs) => {
                this.foundLocations = locs.results;
                this.showDummy = !locs.results.length;
                this.pending$.next(false);
          });
        } else {
            this.showDummy = false;
            this.inputValue$.next('');
            this.foundLocations = [];
            this.pending$.next(false);
        }

        break;
    }
  }
  selectSchool(school) {
    this.selectedSchool = school;
    this.onUpdate.emit(school);
    this.schools.next(null);
  }

  addLocation(location) {
    this.foundLocations = null;
    this.inputValue$.next('');
    this.onSearch('');
    if (!this.selectedOptions.includes(location)) {
      this.selectedOptions.push(location);
      this.onUpdate.emit(this.getEmitedValue());
      if (this.chipsMode) {
        this.inputField = false;
      }
    }
  }

  addUnit(unit) {
    this.selectedOptions.push(unit);
    this.orgunits.next(null);
    this.inputField = false;
    this.onUpdate.emit(this.selectedOptions);
  }

  addRole(role) {
    this.selectedOptions.push(role);
    this.inputField = false;
    this.onUpdate.emit(this.selectedOptions);
  }

  addLocalTeacher(teacher) {
    this.teacherCollection$.next(null);
    this.onUpdate.emit(teacher);
  }

  onBlur(event) {
    setTimeout(() => {
      this.blurEvent.emit(null);
    }, 500);
  }

  addStudent(student: User) {
    if (this.isDisabled(student)) {
      return;
    }
    if (this.chipsMode) {
      this.inputField = false;
    }
    this.students = of([]).toPromise();
    this.inputValue$.next('');
    this.onSearch('');
    if (!this.selectedOptions.includes(student)) {
      this.selectedOptions.push(student);
      this.isOpenedOptions.emit(false);
      this.onUpdate.emit(this.getEmitedValue());
    }
  }

  removeDuplicateStudents(students: User[] | GSuiteSelector[]): User[] | GSuiteSelector[] {
    this.searchCount = students.length;
    this.firstSearchItem = students[0];
    if (!students.length) {
      return [];
    }
    if (students[0] instanceof User || this.searchTarget === 'users') {
      const fixedStudents: User[] = <User[]>students;
      const studentsToRemove: User[] = [];
      for (const selectedStudent of <Array<User>>this.selectedOptions) {
        for (const student of fixedStudents) {
          if (selectedStudent.id === student.id) {
            studentsToRemove.push(student);
          }
        }
      }

      for (const studentToRemove of studentsToRemove) {
        const index = fixedStudents.indexOf(studentToRemove, 0);
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

  isDisabled(item: any) {
    return this.type === 'G Suite' && item && !item.role_compatible;
  }
  cancel(studentInput) {
    studentInput.input.nativeElement.value = '';
    studentInput.input.nativeElement.focus();
    this.students = null;
    this.inputField = false;
    this.onUpdate.emit(this.getEmitedValue());
  }

  update(value) {
    this.selectedOptions = value;
    this.onUpdate.emit(this.selectedOptions);
    if (this.suggestedTeacher && !(this.selectedOptions as any[]).find(t => t.id === this.suggestedTeacher.id)) {
      this.isProposed = true;
    }
  }

  addSuggested(teacher) {
    this.selectedOptions.push(this.suggestedTeacher);
    this.onUpdate.emit(this.selectedOptions);
    this.isProposed = false;
  }

  setAnimationTrigger(value) {
    if (!this.showBackgroundOverlay) {
      interval(200).pipe(take(1), takeUntil(this.destroyAnimation$)).subscribe(() => {
        this.domCheckerService.fadeInOutTrigger$.next(value);
      });
    }
  }

  studentNameOver(cell) {
    this.setAnimationTrigger('fadeIn');
    interval(200).pipe(take(1), takeUntil(this.destroyOpen$)).subscribe(() => {
      cell.isOpenTooltip = true;
    });
  }

  studentNameLeave(cell) {
    this.destroyOpen$.next();
    this.showBackgroundOverlay = false;
    interval(300).pipe(take(1), takeUntil(this.disableClose$)).subscribe(() => {
      cell.isOpenTooltip = false;
    });
  }

  updateOverlayPosition(event) {
    this.renderer.addClass(this.studentPasses.nativeElement, event.connectionPair.panelClass);
  }

  hasStudentRole(user) {
    return user.roles && User.fromJSON(user).isStudent();
  }
}
