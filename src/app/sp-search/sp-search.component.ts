import {Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {MapsAPILoader} from '@agm/core';
import {User} from '../models/User';
import {
  BehaviorSubject,
  interval,
  Observable,
  of,
  Subject,
  combineLatest,
  Subscription,
  fromEvent,
  zip,
  EMPTY
} from 'rxjs'
import {UserService} from '../services/user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpService} from '../services/http-service';
import {School} from '../models/School';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter, finalize,
  map,
  pluck,
  switchMap,
  take,
  takeUntil,
  tap, withLatestFrom
} from 'rxjs/operators'
import { filter as _filter, uniqBy } from 'lodash'
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';
import {ScreenService} from '../services/screen.service';
import {LocationsService} from '../services/locations.service';
import {Location} from '../models/Location';
import {DeviceDetection} from '../device-detection.helper';
import {DomCheckerService} from '../services/dom-checker.service';
import {Overlay} from '@angular/cdk/overlay';
import {KioskModeService} from '../services/kiosk-mode.service';
import {AdminService} from '../services/admin.service';
import { RoundInputComponent } from '../admin/round-input/round-input.component'

declare const window: Window & {google: any};

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
interface OrgUnits{
  path:string
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
  @Input() textAddButton: string | null = null;
  @Input() type: string = 'alternative'; // Can be alternative or G_Suite or GG4L, endpoint will depend on that.
  @Input() isProposed: boolean;
  @Input() proposedSearchString: string;
  @Input() displaySelectedTitle: boolean = true;
  @Input() showStudentInfo: boolean = true;

  @Input() searchingTeachers: User[];
  @Input() searchingRoles: { id: number, role: string, icon: string }[];
  @Input() orgUnits:String[]=[]
  @Input() orgUnitExistCheck:BehaviorSubject<Boolean>

  @Input() filteringUsersCallback?: Function;

  @Output() onUpdate: EventEmitter<any> = new EventEmitter();
  @Output() blurEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() focusEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isOpenedOptions: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() chipsAddEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('studentInput') input: ElementRef;
  @ViewChild('inputComponent') inputComponent: RoundInputComponent;
  @ViewChild('wrapper') wrapper: ElementRef;
  @ViewChild('cell') cell: ElementRef;
  @ViewChild('studentPasses') studentPasses: ElementRef;
  @ViewChild('searchWrapper') set searchWrapper(ref: ElementRef<HTMLDivElement>) {
    if (!ref?.nativeElement) {
      return
    }

    // TODO we need a global document click observable
    // as we use this in many places
    const documentClick$ = fromEvent(document, 'click').pipe(
      takeUntil(this.destroy$),
    );

    const componentClick$ = fromEvent(ref.nativeElement, 'click').pipe(
      takeUntil(this.destroy$),
    );

    // sync addStudent$ with componentClick$
    // to trigger method this._addStudent after click event has been handled by componentClick$
    // in order to make this.isClickOutside accurate
    // as after synchronous this._addStudent,
    // DOM elements used to calculate isClickOutside  will be changed
    // and checking will produces logical errors/bugs
    zip(this.addStudent$, componentClick$).pipe(
      // corect shape or error
      filter(vv => !!vv?.length),
      tap(([student, _]) => {
        this._addStudent(student);
      }),
      takeUntil(this.destroy$),
      catchError(err => {
        // TODO: better way to handle err
        console.log(err);
        return of([]);
      }),
    ).subscribe();

    // only buffered clicks outside of component
    const outside$ = documentClick$.pipe(
      filter((v: PointerEvent) => this.isClickOutside(v, ref)),
    );
    // outside clicks when options panel is open
    const opened$ = outside$.pipe(
      // know the options panel's state
      withLatestFrom(this.isOpenedOptions),
      // ensure options panel is opened
      filter(([_, isOpened]: [PointerEvent, boolean]): boolean => {
        return isOpened;
      }),
      // no interest in event information here
      // just to know that it happened
      map(_ => true),
    );

    opened$.subscribe({next: () => this.closeOptionsPanel()});

    this.lastClickOutside$ = outside$.pipe(tap({next: () => this.closeOptionsPanel()}));
    this.lastClickOutside$.subscribe();
  }

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
  lastSearchText = '';

  // orgUnits:OrgUnits[]=[]

  private lastClickOutside$: Observable<any>;
  private _onSearchUrl$ = new Subject<string>();
  private onSearchUrl$: Observable<string> = this._onSearchUrl$.asObservable().pipe(tap((search: string) => this._onSearch(search)));
  private searchProfileSubscription: Subscription;
  _addStudent$ = new Subject<User>();
  addStudent$ = this._addStudent$.asObservable();

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
    private kioskMode: KioskModeService,
    private adminService:AdminService,
    private elRef: ElementRef,
  ) {
  }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  get isKioskMode() {
    return this.kioskMode.getCurrentRoom().getValue();
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

    this.onSearchUrl$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onSearch(s: string) {
    this._onSearchUrl$.next(s);
  }

  private _onSearch(search: string) {
    this.lastSearchText = search;

    switch (this.searchTarget) {
      case 'users':
          if (search !== '') {
            this.pending$.next(true);
            if (this.type === 'alternative') {
              if(this.kioskMode.isKisokMode()){
                if(this.kioskMode.getKioskModeSettings().findByName && this.kioskMode.getKioskModeSettings().findById){
                 of([this.userService.searchProfile(this.role, 50, search),this.userService.possibleProfileByCustomId(search)])
                 .pipe(switchMap(_ => combineLatest(_))).subscribe((res:any)=>{
                  let finalResult =[]
                  if(res[1].results?.user?.length===undefined){
                   finalResult = [...finalResult,res[1].results.user]
                  }
                  finalResult= [...finalResult,...res[0].results]
                  this.pending$.next(false);
                  this.isOpenedOptions.emit(true);
                  const uu = this.removeDuplicateStudents(finalResult);
                    this.mayRemoveStudentsByCallback(uu);
                   this.students = of([]).toPromise().then(()=>{
                    return this.mayRemoveStudentsByCallback(uu);
                   });
                 })
                }
               else if(this.kioskMode.getKioskModeSettings().findByName && !this.kioskMode.getKioskModeSettings().findById){
                this.students = this.userService.searchProfile(this.role, 50, search)
                .toPromise()
                .then((paged: any) => {
                  this.pending$.next(false);
                  this.isOpenedOptions.emit(true);
                  const uu = this.removeDuplicateStudents(paged.results);
                  return this.mayRemoveStudentsByCallback(uu);
                });
               }else{
                this.students = this.userService.possibleProfileByCustomId(search).toPromise()
                .then((paged: any) => {
                 if(paged.results?.user?.length===undefined){
                  this.pending$.next(false);
                  this.isOpenedOptions.emit(true);
                  const uu = this.removeDuplicateStudents([paged.results.user]);
                  return this.mayRemoveStudentsByCallback(uu);
                 }else{
                  this.pending$.next(false);
                  this.isOpenedOptions.emit(true);
                  const uu = this.removeDuplicateStudents([]);
                  return this.mayRemoveStudentsByCallback(uu);
                 }
                }).catch(err=>{return[]})
               }


              }else{
                // here after first click a listener is created
                // that  ll be alive for the rest of the component's lifetime
                // it triggers a cancelable http request (inner observable)

                // after initialization the flow code
                // goes through here doing nothing

                // already subscribed so noop here
                // so it ensures the code below is ran only once (per component lifetime) no matter how many times clicks arrive here
                if (this.searchProfileSubscription instanceof Subscription && !this.searchProfileSubscription.closed) {
                  return;
                }

                // setup main observable here
                this.searchProfileSubscription = this.onSearchUrl$.pipe(
                  // '' empty string has been/is used to signal no search so skip the search
                  filter(v => !!v),
                  // ensures cancelation for previous request
                  switchMap((search: string) => this.userService.searchProfile(this.role, 50, search)
                    .pipe(
                      filter(Boolean),
                      // ensures cancelation when clicking outside
                      takeUntil(this.lastClickOutside$),
                      finalize(() => {
                        this.pending$.next(false);
                      })
                    )
                  ),
                  catchError((err: Error) => {
                    console.error('SEARCH PROFILE', err.message);
                    this.searchProfileSubscription = null;
                    // skip execution of subscribe.next
                    // but completes
                    // so, next time, main observable will be setup again - kind of reset
                    return EMPTY;
                  }),
                  takeUntil(this.destroy$),
                )
                  .subscribe({
                    next: (paged: any) => {
                      this.isOpenedOptions.emit(true);
                      const uu = this.removeDuplicateStudents(paged.results);
                      this.students = of(this.mayRemoveStudentsByCallback(uu)).toPromise();
                    },
                });


                // the listener is activated above
                // by an initializing click that also expects a result,
                // so do here the expected first job
                // otherwise only the socond click onwards we will get results
                this._onSearchUrl$.next(search);
              }
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
                  //this.showDummy = !users.length;
                  const uu = this.removeDuplicateStudents(users);
                  return this.mayRemoveStudentsByCallback(uu);
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
          const url = `&search=${search}`;
          this.locationService.searchLocations(100, url)
            .subscribe((locs) => {
              this.foundLocations = locs.results;
              this.showDummy = !locs.results.length;
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

  onFocus(event) {
    setTimeout(() => {
      this.focusEvent.emit(null);
    }, 500);
  }

  onBlur(event) {
    setTimeout(() => {
      this.blurEvent.emit(null);
    }, 500);
  }

  addStudent(student: User) {
    this._addStudent$.next(student);
  }
  _addStudent(student: User) {
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

  removeStudents() {
    this.students = of([]).toPromise();
    this.inputValue$.next('');
    this.onSearch('');
    this.isOpenedOptions.emit(false);
    this.onUpdate.emit(this.getEmitedValue());
    this.selectedOptions = [];
  }

  showInputFieldByChips() {
    this.inputField = true;
    this.chipsAddEvent.emit(true);
  }

  removeDuplicateStudents(students: User[] | GSuiteSelector[]): User[] | GSuiteSelector[] {
    this.searchCount = students.length;
    this.firstSearchItem = students[0];
    if (!students.length) {
      return [];
    }

    if (students[0] instanceof User || this.searchTarget === 'users') {
      return uniqBy(students as User[], s => s.id);
    }

    if (students[0] instanceof GSuiteSelector || this.searchTarget === 'orgunits') {
      return (<GSuiteSelector[]>students).filter((gs: GSuiteSelector) => {
        if ( this.selectedOptions.findIndex((_gs: GSuiteSelector) => _gs.path === gs.path) === -1) {
          return gs;
        }
      });
    }
  }

  // safe to call as it checks itself to have a callback to call
  // otherwise it returns unchanged User[]
  mayRemoveStudentsByCallback(students: User[] | GSuiteSelector[]) : User[] | GSuiteSelector[] {
    // if provided an extra filtering use it
    if (!!this.filteringUsersCallback) {
      const filtered =  this.filteringUsersCallback(students);
      this.showDummy = !filtered.length;
      return filtered;
    }
    return students;
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

  reset() {
    this.selectedOptions = [];
    this.onUpdate.emit(undefined);
  }

  // this checks MUST happens before any view change that angular may operates
  // read comments down bellow
  isClickOutside(evt: PointerEvent, componentWrapperReference: ElementRef<HTMLDivElement>): boolean {
    const $container = componentWrapperReference.nativeElement;
    const $containee = evt.target as HTMLElement;
    const inside = $container.contains($containee);

    return !inside;
  }

  closeOptionsPanel(): void {
    // inputComponent exists only when flag inputField
    if (this.inputField) {
      // be wary of this.reset(); it emits undefined => unhandled elsewere
      // TODO reset method by default triggers a focus on inputComponent
      // which may have unintended effects
      // rest without focus-ing
      this.inputComponent.reset(false);
    }
  }
}
