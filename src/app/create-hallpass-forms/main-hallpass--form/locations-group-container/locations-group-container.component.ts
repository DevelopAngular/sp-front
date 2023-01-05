import {ChangeDetectorRef, Component, EventEmitter, forwardRef, Inject, Injector, Input, OnInit, Output, ViewChild, OnDestroy, HostListener, ElementRef} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {User} from '../../../models/User';
import {DataService} from '../../../services/data-service';
import {Pinnable} from '../../../models/Pinnable';
import {Util} from '../../../../Util';
import {FormFactor, MainHallPassFormComponent, Navigation} from '../main-hall-pass-form.component';
import {CreateFormService} from '../../create-form.service';
import {NextStep} from '../../../animations';
import {LocationsService} from '../../../services/locations.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {FromWhereComponent} from './from-where/from-where.component';
import {ToCategoryComponent} from './to-category/to-category.component';
import {RestrictedTargetComponent} from './restricted-target/restricted-target.component';
import {RestrictedMessageComponent} from './restricted-message/restricted-message.component';
import {ToWhereComponent} from './to-where/to-where.component';
import {ScreenService} from '../../../services/screen.service';
import {DeviceDetection} from '../../../device-detection.helper';
import {filter, map, withLatestFrom} from 'rxjs/operators';
import {Location} from '../../../models/Location';
import {LocationVisibilityService} from '../location-visibility.service';
import {PassLimitDialogComponent} from './pass-limit-dialog/pass-limit-dialog.component';
import { KioskModeService } from '../../../services/kiosk-mode.service'

// when WS notify a change we have to skip functions that change
// FORM_STATE state and step
function skipWhenWS() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = function (...args) {
      const byws = this.formService.updatedByWS$.getValue();
      if (byws) {
        return;
      }
      return fn.apply(this, args);
    };
  };
}

export enum States { from = 1, toWhere = 2, category = 3, restrictedTarget = 4, message = 5 }

@Component({
  selector: 'app-locations-group-container',
  templateUrl: './locations-group-container.component.html',
  styleUrls: ['./locations-group-container.component.scss'],
  animations: [NextStep]
})
export class LocationsGroupContainerComponent implements OnInit, OnDestroy {

  @Input() FORM_STATE: Navigation;
  @Output() nextStepEvent: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(FromWhereComponent) fromWhereComp;
  @ViewChild(forwardRef(() => ToWhereComponent)) toWhereComp;
  @ViewChild(ToCategoryComponent) toCategoryComp;
  @ViewChild(RestrictedTargetComponent) restTargetComp;
  @ViewChild(RestrictedMessageComponent) restMessageComp;

  user$: Observable<User>;
  user: User;
  isStaff: boolean;
  pinnables: Observable<Pinnable[]>;
  pinnable: Pinnable;
  data: any = {};
  frameMotion$: BehaviorSubject<any>;

  @HostListener('document:click', ['$event'])
  clickHandler(event: PointerEvent) {
    // click inside component?
    if(this.elRef.nativeElement.contains(event.target)) {
      // event.path or event.composedPath ?
      const names = (event?.composedPath() ?? (event as any).path).map((e: HTMLElement) => {
        return e.tagName?.toLowerCase();
      });
      // those are like buttons and capture the user clicks
      const clicked = ['app-location-cell', 'app-pinnable'].some(e => names.includes(e));
      if (clicked) {
        // change is triggered by user not by WSocket
        this.formService.updatedByWS$.next(false);
      }
    }
  }
  parentMainHallPassForm: MainHallPassFormComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dataService: DataService,
    private formService: CreateFormService,
    private locationsService: LocationsService,
    private screenService: ScreenService,
    private visibilityService: LocationVisibilityService,
    private elRef: ElementRef,
    private _injector: Injector,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private kioskService: KioskModeService
  ) {
  }

  private destroy$ = new Subject();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get showDate() {
    if (this.FORM_STATE.data.date) {
      if (!this.FORM_STATE.data.date.date) {
        return false;
      } else {
        return Util.formatDateTime(new Date(this.FORM_STATE.data.date.date));
      }

    }
  }

  get studentText() {
    if (this.isStaff) {
      if (!this.FORM_STATE.data.selectedStudents) {
        return false;
      } else if (this.FORM_STATE.data.selectedGroup) {
        return this.FORM_STATE.data.selectedGroup.title;
      } else {
        const students = this.FORM_STATE.data.direction.from === null
        ? this.FORM_STATE.data.selectedStudents
        : this.FORM_STATE.data?.roomStudents ?? this.FORM_STATE.data.selectedStudents;
        return students[0].display_name + (students.length > 1 ? ` (${students.length - 1})` : '');
      }
    }
  }

  // return true if there is only one possible teacher to select for a request.
  shouldSkipTeacherSelect() {
    const to = this.FORM_STATE.data.direction.to;
    return (!this.FORM_STATE.forLater && to.request_mode === 'specific_teachers' && to.request_teachers.length === 1) ||
      (!this.FORM_STATE.forLater && to.request_mode === 'all_teachers_in_room') ||
      (!this.FORM_STATE.forLater && this.teachersLength === 1) ||
      (this.FORM_STATE.forLater && to.scheduling_request_mode === 'specific_teachers' && to.scheduling_request_teachers.length === 1) ||
      (this.FORM_STATE.forLater && to.scheduling_request_mode === 'all_teachers_in_room') ||
      (this.FORM_STATE.forLater && this.teachersLength === 1);
  }

  getTeacherChoicesForTeacherInRoom(): User[] {
    const to = this.FORM_STATE.data.direction.to;
    const from = this.FORM_STATE.data.direction.from;
    if (to.request_mode === 'teacher_in_room') {
      if (to.request_send_origin_teachers && !to.request_send_destination_teachers) {
        return from.teachers;
      } else if (!to.request_send_origin_teachers && to.request_send_destination_teachers) {
        return to.teachers;
      } else if (to.request_send_origin_teachers && to.request_send_destination_teachers) {
        return to.teachers.concat(from.teachers); // TODO does not handle teacher being in origin and destination
      }
    }
    if (to.scheduling_request_mode === 'teacher_in_room') {
      if (to.scheduling_request_send_origin_teachers && !to.scheduling_request_send_destination_teachers) {
        return from.teachers;
      } else if (!to.scheduling_request_send_origin_teachers && to.scheduling_request_send_destination_teachers) {
        return to.teachers;
      } else if (to.scheduling_request_send_origin_teachers && to.scheduling_request_send_destination_teachers) {
        return to.teachers.concat(from.teachers);
      }
    }

    return [];
  }

  get teachersLength() {
    return this.getTeacherChoicesForTeacherInRoom().length;
  }

  ngOnInit() {
    this.parentMainHallPassForm = this._injector.get<MainHallPassFormComponent>(MainHallPassFormComponent);
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.FORM_STATE.quickNavigator = false;

    this.data.fromLocation = this.FORM_STATE.data.direction && this.FORM_STATE.data.direction.from ? this.FORM_STATE.data.direction.from : null;
    this.data.toLocation = this.FORM_STATE.data.direction && this.FORM_STATE.data.direction.to ? this.FORM_STATE.data.direction.to : null;

    this.user$ = this.dataService.currentUser;
    this.user$.subscribe({
      next: (user: User) => {
        this.isStaff = user.isTeacher() || user.isAdmin() || user.isAssistant();
        this.user = user;
      },
    });

    this.pinnables = this.formService.getPinnable(!!this.dialogData['kioskModeRoom']).pipe(
      // restrict all rooms, so the teacher request is mandatory
      filter(pins => pins.length > 0),
      // this.user$ observable may be slover than this.pinnable$
      // may be a chance that we will not have a this.user ready
      // so this ensures we wait (or not) for having a user
      // this.user$ can be a student or a staff!!!
      withLatestFrom(this.user$),
      map(([pins, user]) => {
        const student = [user];
        const stateData = this.FORM_STATE.data;
        const isDedicatedUser = this.FORM_STATE.kioskMode &&
          ((!!user?.roles.includes('_profile_kiosk') || stateData?.kioskModeStudent instanceof User));
        const isStaffUser = ((!this.user.isStudent()) && this.FORM_STATE.kioskMode);
        const isChooseSelectedStudent = (isStaffUser || isDedicatedUser);

        // on kioskmode student is found in selectedStudents[0]
        if (isChooseSelectedStudent) {
          // TODO when not found case
          student[0] = stateData.kioskModeStudent || stateData.selectedStudents[0];
        }
        pins = pins.filter(p => {
          // filtering here based on location and student may return (or not) a pinnable
          if (p.type === 'location' && p.location !== null) {
            // is a Location
            try {
              const loc = Location.fromJSON(p.location);
              // staff is unfiltered but not in kiosk mode
              if (this.isStaff && !this.FORM_STATE?.kioskMode) {
                return p;
              }
              // filter students here
              if (this.visibilityService.filterByVisibility(loc, student)) {
                return p;
              }
            } catch (e) {
            }
          // folder containing pinnables
          } else if (p.type === 'category') {
            return p;
          }
        });


        const { passLimitInfo } = this.FORM_STATE;
        if (!passLimitInfo?.showPasses) {
          return pins;
        }

        if (passLimitInfo.current === 0) {
          pins.forEach(p => {
            if (p.location === null) { // ignore folders
              return p;
            }
            if (!p?.location?.restricted) {
              p.location.restricted = true;
            }
          });
        }
        return pins;
      })
    );
    this.pinnable = this.FORM_STATE.data.direction ? this.FORM_STATE.data.direction.pinnable : null;
  }

  fromWhere(location) {
    if (this.FORM_STATE.data.hasClose) {
      return this.nextStepEvent.emit(
        {
          action: 'exit',
          data: {
            'fromLocation': location
          }
        });
    }
    this.data.fromLocation = location;
    this.FORM_STATE.data.direction = {
      from: location,
      to: this.data.toLocation,
      pinnable: this.pinnable
    };
    if (this.FORM_STATE.state < this.FORM_STATE.previousState) {
      [this.FORM_STATE.state, this.FORM_STATE.previousState] = [this.FORM_STATE.previousState, this.FORM_STATE.state];
    } else {
      if (this.FORM_STATE.fromState > 1) {
        this.FORM_STATE.state = this.FORM_STATE.fromState;
      } else {
        if (this.FORM_STATE.missedRequest) {
          this.FORM_STATE.state = States.message;
          this.FORM_STATE.data.gradient = this.FORM_STATE.data.request.color_profile.gradient_color;
          this.FORM_STATE.data.requestTarget = this.FORM_STATE.data.request.issuer;
          this.FORM_STATE.data.direction.pinnable = this.FORM_STATE.data.request;
        } else {
          this.FORM_STATE.state = States.toWhere;
        }
      }
      this.FORM_STATE.previousState = States.from;

    }
  }

  maybeSkipTeacherSelect(): States {
    if (!this.shouldSkipTeacherSelect()) {
      return States.restrictedTarget;
    }

    const to = this.FORM_STATE.data.direction.to;
    const requestMode = this.FORM_STATE.forLater ? to.scheduling_request_mode : to.request_mode;

    let teacher: User;

    if (requestMode === 'teacher_in_room') {
      teacher = this.getTeacherChoicesForTeacherInRoom()[0];
    } else {
      teacher = this.user;
    }

    if (location.host !== 'smartpass.app') {
      console.log('setting teacher to:', teacher);
    }

    this.data.requestTarget = teacher;
    this.FORM_STATE.data.requestTarget = teacher;

    return States.message;
  }

  @skipWhenWS()
  toWhere(pinnable) {
    this.pinnable = pinnable;
    this.FORM_STATE.data.direction = {
      from: this.data.fromLocation,
      pinnable: pinnable
    };
    this.FORM_STATE.data.gradient = pinnable.color_profile.gradient_color;
    this.FORM_STATE.data.icon = pinnable.icon;
    if (pinnable.type === 'category') {
      this.FORM_STATE.previousState = States.toWhere;
      return this.FORM_STATE.state = States.category;
    } else {
      this.data.toLocation = pinnable.location;
      console.log(this.FORM_STATE.data.direction.from, this.data.toLocation);
      this.FORM_STATE.data.direction.to = pinnable.location;

      const restricted = ((this.pinnable.location.restricted && !this.showDate) || (this.pinnable.location.scheduling_restricted && !!this.showDate));
      if (!this.isStaff && restricted && pinnable.location) {
        this.FORM_STATE.previousState = this.FORM_STATE.state;
        this.FORM_STATE.state = this.maybeSkipTeacherSelect();
        return;
      } else if (this.FORM_STATE.forLater && this.isStaff) {
        this.FORM_STATE.previousState = this.FORM_STATE.state;
        this.FORM_STATE.state = States.message;
      } else {
        return this.postComposetData();
      }
    }
  }

  debugLog(...msgs: any[]) {
    if (location.host !== 'smartpass.app') {
      console.log(...msgs);
    }
  }

  @skipWhenWS()
  toWhereFromLocation(location: Location) {
    this.pinnables.pipe(
      map(pins => {
        return pins.find(pinnable => {
          if (pinnable.type === 'category' && location.category) {
            return pinnable.category === location.category || pinnable.title === location.category;
          } else if (pinnable.type === 'location') {
            return (pinnable.location.id + '') === (location.id + '');
          }
        });
      }),
    ).subscribe(pinnable => {
      if (pinnable.type === 'location') {
        this.toWhere(pinnable);
      } else if (pinnable.type === 'category') {
        this.pinnable = pinnable;
        this.FORM_STATE.data.direction = {
          from: this.data.fromLocation,
          pinnable: pinnable
        };
        this.FORM_STATE.data.gradient = pinnable.color_profile.gradient_color;
        this.FORM_STATE.data.icon = pinnable.icon;
        this.fromCategory(location);
      }
    });
  }

  showDestinationLimitReachedFromCategory(passLimit: number, studentCount: number, currentCount: number, isStudent: boolean) {
    return new Promise<boolean>(resolve => {
      const dialogRef = this.dialog.open(PassLimitDialogComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-backdrop',
        width: '450px',
        height: '215px',
        disableClose: true,
        data: {
          passLimit,
          studentCount,
          currentCount,
          isStudent
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.override) {
          setTimeout(() => {
            return resolve(true);
          }, 200);
        } else {
          return resolve(false);
        }
      });
    });
  }

  @skipWhenWS()
  async fromCategory(location: Location & { numberOfStudentsInRoom?: number }) {
    const { numberOfStudentsInRoom } = location;
    if (!this.kioskService.isKisokMode() && numberOfStudentsInRoom !== undefined) {
      const totalStudents = numberOfStudentsInRoom + this.FORM_STATE.data.selectedStudents.length;
      let reached = location?.max_passes_to_active;
      if (this.user.isStudent() || this.kioskService.isKisokMode()) {
        reached = reached && totalStudents >= location.max_passes_to
      } else {
        reached = reached && totalStudents > location.max_passes_to;
      }

      if (reached) {
        const overrideRoomLimit = await this.showDestinationLimitReachedFromCategory(
          location.max_passes_to,
          this.FORM_STATE.data.selectedStudents.length,
          numberOfStudentsInRoom,
          this.user.isStudent());

        if (!overrideRoomLimit || (overrideRoomLimit && this.user.isStudent())) {
          return;
        }
      }
    }

    const { passLimitInfo } = this.FORM_STATE;
    location.restricted = location.restricted || (passLimitInfo?.showPasses && passLimitInfo?.current === 0);
    this.data.toLocation = location;
    this.FORM_STATE.data.direction.to = location;
    if (((location.restricted && !this.FORM_STATE.forLater) || (location.scheduling_restricted && this.FORM_STATE.forLater)) && !this.isStaff) {
      this.FORM_STATE.previousState = States.from;
      this.FORM_STATE.state = this.maybeSkipTeacherSelect();
    } else if (this.FORM_STATE.forLater && this.isStaff) {
      this.FORM_STATE.previousState = this.FORM_STATE.state;
      this.FORM_STATE.state = States.message;
    } else {
      this.postComposetData();
    }
  }

  requestTarget(teacher) {
    this.data.requestTarget = teacher;
    this.FORM_STATE.data.requestTarget = teacher;
    this.FORM_STATE.state = States.message;
  }

  resultMessage(message, denyMessage: boolean = false) {
    if (!message) {
      message = '';
    }
    this.data.message = message;
    this.FORM_STATE.data.message = message;
    this.postComposetData(denyMessage, true);
  }

  @skipWhenWS()
  private postComposetData(close: boolean = false, isMessage?: boolean) {
    const restricted = ((this.FORM_STATE.data.direction.to.restricted && !this.FORM_STATE.forLater) ||
      (this.FORM_STATE.data.direction.to.scheduling_restricted && !!this.FORM_STATE.forLater));
    if (this.FORM_STATE.kioskMode && this.FORM_STATE.data.kioskModeStudent && restricted) {
      this.isStaff =  false;
    }
    if (!this.isStaff && !restricted) {
      this.FORM_STATE.formMode.formFactor = FormFactor.HallPass;
    }
    if (!this.isStaff && (restricted || isMessage)) {
      this.FORM_STATE.formMode.formFactor = FormFactor.Request;
    }
    if (this.isStaff) {
      if (this.FORM_STATE.data.date && this.FORM_STATE.data.date.declinable) {
        this.FORM_STATE.formMode.formFactor = FormFactor.Invitation;
      } else {
        this.FORM_STATE.formMode.formFactor = FormFactor.HallPass;
      }
    }

    this.FORM_STATE.previousStep = 3;
    setTimeout(() => {
      this.FORM_STATE.step = close ? 0 : 4;
      this.nextStepEvent.emit(this.FORM_STATE);
    }, 100);
  }

  back(event) {
    if (this.FORM_STATE.fromState === 4) {
      this.parentMainHallPassForm.dialogData = {
        ...this.parentMainHallPassForm.dialogData,
        passLimitInfo: undefined
      };
      this.cdr.detectChanges();
    }
    this.FORM_STATE = event;
    this.data.message = null;
    this.FORM_STATE.data.message = null;

    this.nextStepEvent.emit(this.FORM_STATE);
  }

  stepBack() {
    switch (this.FORM_STATE.state) {
      case 1:
        this.fromWhereComp.back();
        this.nextStepEvent.emit(this.FORM_STATE);
        break;
      case 2:
        if (this.toWhereComp) {
          this.toWhereComp.back();
        }
        break;
      case 3:
        if (this.toCategoryComp) {
          this.toCategoryComp.back();
        }
        break;
      case 4:
        if (this.restTargetComp) {
          this.restTargetComp.back();
        }
        break;
      case 5:
        this.restMessageComp.back();
        break;
    }
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

  get pwaBackBtnVisibility() {
    return this.screenService.isDeviceLargeExtra;
  }
}
