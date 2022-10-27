import {ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CreateFormService} from '../../../create-form.service';
import {MatDialogRef} from '@angular/material/dialog';
import {MainHallPassFormComponent, Navigation} from '../../main-hall-pass-form.component';
import {ScreenService} from '../../../../services/screen.service';
import {LocationVisibilityService} from '../../location-visibility.service';
import {BehaviorSubject, forkJoin, Subject, combineLatest, Observable} from 'rxjs';
import {filter, takeUntil, tap, map, shareReplay} from 'rxjs/operators';
import {User} from '../../../../models/User';
import {GSuiteSelector, SPSearchComponent} from '../../../../sp-search/sp-search.component';
import {PassLimitService} from '../../../../services/pass-limit.service';
import {KioskModeService} from '../../../../services/kiosk-mode.service';
import {LocationsService} from '../../../../services/locations.service';
import {PollingEvent} from '../../../../services/polling-service';
import {Location} from '../../../../models/Location';

@Component({
  selector: 'app-who-you-are',
  templateUrl: './who-you-are.component.html',
  styleUrls: ['./who-you-are.component.scss']
})
export class WhoYouAreComponent implements OnInit {

  @Input() formState: Navigation;
  @Output() stateChangeEvent: EventEmitter<Navigation> = new EventEmitter();

  frameMotion$: BehaviorSubject<any>;
  placeholder:string="Search students"

  constructor(
    private dialogRef: MatDialogRef<WhoYouAreComponent>,
    private formService: CreateFormService,
    private screenService: ScreenService,
    private passLimitsService: PassLimitService,
    private _injector: Injector,
    private cdr: ChangeDetectorRef,
    private visibilityService: LocationVisibilityService,
    private kioskService : KioskModeService,
    private locationsService: LocationsService,
  ) { 

  }

  private destroy$ = new Subject();

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.setPlaceHolder();
    
    if (this.listenLocation$ !== null) {
      return;
    } 
    this.listenLocation$ = this.locationsService.listenLocationSocket().pipe(
      takeUntil(this.destroy$),
      filter((res: any | unknown & {data: any}) => (!!res && ('data' in res))),
      map(({data}) => data),
      shareReplay(1),
    );
    this.listenLocation$.subscribe();

    this.searchCmp$.pipe(
      filter(Boolean),
      takeUntil(this.destroy$),
    );
    this.searchCmp$.subscribe();
    this.subscribeWSUpdate();
  }

  listenLocation$: Observable<PollingEvent> = null;

  searchCmp$: Subject<boolean> = new Subject();
  private _searchCmp: SPSearchComponent;
  @ViewChild(SPSearchComponent) set searchCmp(v: SPSearchComponent) {
    this.searchCmp$.next(true);
    this._searchCmp = v;
  }
  get searchCmp(): SPSearchComponent {
    return this._searchCmp;
  }

  subscribeWSUpdate() {
    combineLatest(this.listenLocation$, this.searchCmp$)
    .pipe(
      takeUntil(this.destroy$),
      tap(([data, _]) => {
        try {
          const loc: Location = Location.fromJSON(data);
          this.locationsService.updateLocationSuccessState(loc);
          this.formState.data.direction.from = loc;
          // refresh search
          // as if the user was searching again
          // posible annoying behavior but pretty improbable
          // for an admin to change a location while a teacher like role searches 
          const val = this.searchCmp.lastSearchText;
          this.searchCmp.onSearch(val);
        } catch(e) {
          console.log(e);
        }
      }),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
 
  // used for filtering users found with sp-search component
  getFilteringStudents(): (users: User[] | GSuiteSelector[]) => User[] | GSuiteSelector[] {
    return ((uu) => {
      const students = [...uu];
      const loc = this.formState.data.direction.from;
      const skipped = this.visibilityService.calculateSkipped(students, loc) ?? [];
      const result = !skipped.length ? uu : uu.filter(u => !skipped.includes(''+u.id));
      return result;
    }).bind(this);
  }

  showSearchElseLoading = true;

  setSelectedStudents(evt) {
    this.showSearchElseLoading = false;

    this.formService.setFrameMotionDirection('forward');
    this.formService.compressableBoxController.next(false);

    if (this.formState.forLater) {
      setTimeout(() => {
        this.formState.step = 1;
        this.formState.fromState = 1;
        this.formState.data.selectedStudents = evt;
        this.stateChangeEvent.emit(this.formState);

        this.showSearchElseLoading = true;
      }, 100);
      return;
    }

    const mainParent = this._injector.get<MainHallPassFormComponent>(MainHallPassFormComponent);
    forkJoin({
      studentPassLimit: this.passLimitsService.getStudentPassLimit((evt[0] as User).id),
      remainingLimit: this.passLimitsService.getRemainingLimits({ studentId: (evt[0] as User).id })
    }).subscribe({
      next: ({ studentPassLimit, remainingLimit }) => {
        const passLimitInfo = {
          max: studentPassLimit.passLimit,
          showPasses: !studentPassLimit.noLimitsSet && !studentPassLimit.isUnlimited && studentPassLimit.passLimit !== null,
          current: remainingLimit.remainingPasses
        };
        mainParent.dialogData.passLimitInfo = passLimitInfo;
        mainParent.FORM_STATE = {
          ...mainParent.FORM_STATE,
          passLimitInfo,
          state: 2,
          step: 3,
          fromState: 4,
          data: {
            ...mainParent.FORM_STATE.data,
            selectedStudents: evt,
            kioskModeStudent: evt[0]
          }
        };
        this.stateChangeEvent.emit(mainParent.FORM_STATE);
        this.cdr.detectChanges();
      }
    });
  }
  back() {
    this.dialogRef.close();
  }

  setPlaceHolder(){
    if(this.kioskService.isKisokMode){
      if(this.kioskService.getKioskModeSettings().findByName && this.kioskService.getKioskModeSettings().findById){
        this.placeholder= "Type name, email, or ID number"
      }else if(this.kioskService.getKioskModeSettings().findByName){
        this.placeholder= "Type name or email"
      }else{
        this.placeholder= "Type ID number"
        
      }
    }
  }

}
