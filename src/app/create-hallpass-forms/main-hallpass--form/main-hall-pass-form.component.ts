import {ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Location } from '../../models/Location';
import { Pinnable } from '../../models/Pinnable';
import { User } from '../../models/User';
import { StudentList } from '../../models/StudentList';
import {NextStep} from '../../animations';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {CreateFormService} from '../create-form.service';
import {filter, map, takeUntil} from 'rxjs/operators';
import { find, cloneDeep } from 'lodash';
import {DataService} from '../../services/data-service';
import {LocationsService} from '../../services/locations.service';
import {ScreenService} from '../../services/screen.service';
import {DeviceDetection} from '../../device-detection.helper';
import {HallPassesService} from '../../services/hall-passes.service';
import {CreateHallpassFormsComponent} from '../create-hallpass-forms.component';

export enum Role { Teacher = 1, Student = 2 }

export enum FormFactor { HallPass = 1, Request = 2, Invitation = 3 }

export interface FormMode {
  role?: number;
  formFactor?: number;
}

export interface Navigation {
  step: number;
  previousStep?: number;
  state?: number;
  previousState?: number;
  fromState?: number;
  formMode?: FormMode;
  data?: {
    request?: any,
    date?: any;
    selectedStudents?: User[];
    selectedGroup?: StudentList;
    teacherRooms?: Pinnable[];
    direction?: {
      from?: Location;
      to?: Location;
      pinnable?: Pinnable;
    },
    icon?: string
    gradient?: string;
    message?: string,
    requestTarget?: User,
    hasClose?: boolean
  };
  quickNavigator?: boolean;
  forInput?: boolean;
  forLater?: boolean;
  missedRequest?: boolean;
  resendRequest?: boolean;
  kioskMode?: boolean;
}

@Component({
  selector: 'app-main-hallpass-form',
  templateUrl: './main-hall-pass-form.component.html',
  styleUrls: ['./main-hall-pass-form.component.scss'],
  animations: [NextStep]
})
export class MainHallPassFormComponent implements OnInit, OnDestroy {

  public FORM_STATE: Navigation;
  public formSize = {
    containerHeight: '0px',
    containerWidth: '0px',
    height: '0px',
    width: '0px'
  };
  frameMotion$: BehaviorSubject<any>;

  user;
  isStaff;
  isDeviceMid: boolean;
  isDeviceLarge: boolean;

  private destroy$ = new Subject();

  @HostListener('window:resize')
  checkDeviceScreen() {
    this.isDeviceMid = this.screenService.isDeviceMid;
    this.isDeviceLarge = this.extraLargeDevice;
    this.setFormSize();
  }

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<CreateHallpassFormsComponent>,
    private formService: CreateFormService,
    private elementRef: ElementRef,
    private dataService: DataService,
    private locationsService: LocationsService,
    private screenService: ScreenService,
    private passesService: HallPassesService,
  ) {}

  get isCompressed() {
    return  this.formService.compressableBoxController.asObservable();
  }
  get isScaled() {
    return  this.formService.scalableBoxController.asObservable();
  }

  ngOnInit() {
    this.isDeviceMid = this.screenService.isDeviceMid;
    this.isDeviceLarge = this.screenService.isDeviceLarge;
    this.frameMotion$ = this.formService.getFrameMotionDirection();

    this.FORM_STATE = {
      step: null,
      previousStep: 0,
      state: 1,
      fromState: null,
      formMode: {
        role: null,
        formFactor: null,
      },
      data: {
        selectedGroup: null,
        selectedStudents: [],
        direction: {
          from: this.dialogData['kioskModeRoom'] || null
        },
      },
      forInput: this.dialogData['forInput'] || false,
      forLater: this.dialogData['forLater'],
      kioskMode: this.dialogData['kioskMode'] || false
    };
    switch (this.dialogData['forInput']) {
      case true:
        this.FORM_STATE.formMode.role = this.dialogData['forStaff'] ? Role.Teacher : Role.Student;
        if (this.dialogData['forLater']) {
          if (this.dialogData['forStaff']) {
            this.FORM_STATE.step = 2;
            this.FORM_STATE.state = this.dialogData['kioskMode'] ? 4 : 1;
            this.FORM_STATE.formMode.formFactor = FormFactor.Invitation;
          } else {
            this.FORM_STATE.step = 1;
            this.FORM_STATE.formMode.formFactor = FormFactor.HallPass;
          }
        } else {
          this.FORM_STATE.formMode.formFactor = FormFactor.HallPass;
          if ( this.dialogData['forStaff'] ) {
            if (this.dialogData['kioskMode'] && this.dialogData['kioskModeSelectedUser']) {
              this.FORM_STATE.data.selectedStudents = this.dialogData['kioskModeSelectedUser'];
                this.FORM_STATE.step = 3;
                this.FORM_STATE.state = 2;
            } else {
                this.FORM_STATE.step = 2;
                this.FORM_STATE.state = this.dialogData['kioskMode'] ? 4 : 1;
            }
          } else {
            this.FORM_STATE.step = 3;
          }
        }
        break;
      case false:
        if (this.dialogData['hasClose']) {
         this.FORM_STATE.data.hasClose = true;
        }
        if (this.dialogData['missedRequest']) {
          this.FORM_STATE.missedRequest = true;
        }
        if (this.dialogData['resend_request']) {
          this.FORM_STATE.resendRequest = true;
        }
        this.FORM_STATE.formMode.formFactor = FormFactor.Request;
        this.FORM_STATE.formMode.role = this.dialogData['isDeny'] ? Role.Teacher : Role.Student;
        this.FORM_STATE.step = this.dialogData['entryState'].step;
        this.FORM_STATE.state = this.dialogData['entryState'].state;
        this.FORM_STATE.data.date = {
          date: this.dialogData['request_time']
        };
        this.FORM_STATE.data.request = this.dialogData['request'];
        this.FORM_STATE.data.requestTarget = this.dialogData['teacher'];
        this.FORM_STATE.data.gradient = this.dialogData['gradient'];
        this.FORM_STATE.data.direction = {
          from: this.dialogData['originalFromLocation'],
          to: this.dialogData['originalToLocation']
        };
        break;
    }

    this.setFormSize();
    this.setContainerSize('end');
    this.checkDeviceScreen();
      this.dataService.currentUser
        .pipe(takeUntil(this.destroy$))
        .subscribe((user: User) => {
          this.isStaff = user.isTeacher() || user.isAssistant();
          this.user = user;
      });

      combineLatest(
          this.passesService.getPinnablesRequest(),
          this.locationsService.getLocationsWithTeacherRequest(this.user))
          .pipe(
            filter(([pin, locs]: [Pinnable[], Location[]]) => this.isStaff && !!pin.length && !!locs.length),
              takeUntil(this.destroy$),
              map(([pinnables, locations]) => {
                  const filterPinnables = cloneDeep(pinnables).filter(pin => {
                      return locations.find(loc => {
                          return (loc.category ? loc.category : loc.title) === pin.title;
                      });
                  });
                  return filterPinnables.map(fpin => {
                      if (fpin.type === 'category') {
                          const locFromCategory = find(locations, ['category', fpin.title]);
                          fpin.title = locFromCategory.title;
                          fpin.type = 'location';
                          fpin.location = locFromCategory;
                          return fpin;
                      }
                      return fpin;
                  });
              })).subscribe(rooms => {
          this.FORM_STATE.data.teacherRooms = rooms;
      });

    this.dialogRef
      .backdropClick()
      .subscribe(() => {
        this.formService.setFrameMotionDirection('disable');
        this.formService.compressableBoxController.next(false);
        this.formService.scalableBoxController.next(false);
        this.dialogRef.close();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNextStep(evt) {
    if (evt.step === 0 || evt.action === 'exit') {
      this.formService.setFrameMotionDirection('disable');
      this.formService.compressableBoxController.next(false);
      this.formService.scalableBoxController.next(false);
      this.dialogRef.close(evt);
    } else {
      // console.log('STEP EVENT ===>', evt);
      this.FORM_STATE = evt;
    }
    // this.setFormSize();
  }

  setContainerSize(startOrEnd: 'start' | 'end') {
    // return
    switch (startOrEnd) {
      case 'start':
        this.formSize.containerWidth = this.formSize.width;
        this.formSize.containerHeight =  this.formSize.height;
        // this.cd.detectChanges();
        break;
      case 'end':
        this.formSize.containerWidth =  `${window.innerWidth}px`;
        this.formSize.containerHeight =  `${window.innerHeight}px`;
        // this.cd.detectChanges();
        break;
    }
  }

  setFormSize() {
    // const form = this.elementRef.nativeElement.closest('.mat-dialog-container');
    //       form.style.boxShadow = 'none';
    //       if (form && this.FORM_STATE.step !== 4) {
    //         form.style.boxShadow = '0 2px 26px 0px rgba(0, 0, 0, 0.15)';
    //       }

    switch (this.FORM_STATE.step) {
      case 1:
        this.formSize.width =  `425px`;
        this.formSize.height =  `500px`;
        break;
      case 2:
        if (this.dialogData['kioskModeRoom']) {
          this.formSize.width =  `425px`;
          this.formSize.height =  `500px`;
        } else {
          this.formSize.width =  this.extraLargeDevice ?  `335px` : `700px`;
          this.formSize.height = this.extraLargeDevice ?  `500px` : `400px`;
        }
        break;
      case 3:
        this.formSize.width =  `425px`;
        this.formSize.height =  `500px`;
        break;
      case 4:
        // if (form) {
        //   // form.style.boxShadow = 'none';
        // }
        this.formSize.width =  `335px`;
        this.formSize.height =  this.FORM_STATE.formMode.role === 1 ? `451px` : '412px';
        break;
    }
  }

  get extraLargeDevice() {
    return this.screenService.isDeviceLargeExtra;
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

}
