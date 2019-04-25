import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Location } from '../../models/Location';
import { Pinnable } from '../../models/Pinnable';
import { Request } from '../../models/Request';
import { User } from '../../models/User';
import { StudentList } from '../../models/StudentList';
import {NextStep, ScaledCard} from '../../animations';
import {BehaviorSubject, Observable} from 'rxjs';
import {CreateFormService} from '../create-form.service';
import {Invitation} from '../../models/Invitation';
import {PassLike} from '../../models';

export enum Role { Teacher = 1, Student = 2 }

export enum FormFactor { HallPass = 1, Request = 2, Invitation = 3 }

export interface FormMode {
  role?: number;
  formFactor?: number;
}

export interface Navigation {
  step: number;
  previousStep?: number;
  quickNavigator?: boolean;
  state?: any;
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
  forInput?: boolean;
  forLater?: boolean;
  missedRequest?: boolean;
  resendRequest?: boolean;
}



@Component({
  selector: 'app-main-hallpass-form',
  templateUrl: './main-hall-pass-form.component.html',
  styleUrls: ['./main-hall-pass-form.component.scss'],
  animations: [NextStep, ScaledCard]

})
export class MainHallPassFormComponent implements OnInit {

  public FORM_STATE: Navigation;
  public formSize = {
    height: '0px',
    width: '0px'
  }
  frameMotion$: BehaviorSubject<any>;

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<MainHallPassFormComponent>,
    private formService: CreateFormService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
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
        direction: {},
      },
      forInput: this.dialogData['forInput'] || false,
      forLater: this.dialogData['forLater']
    };
    switch (this.dialogData['forInput']) {
      case true:
        this.FORM_STATE.formMode.role = this.dialogData['forStaff'] ? Role.Teacher : Role.Student;
        if (this.dialogData['forLater']) {
          if (this.dialogData['forStaff']) {
            this.FORM_STATE.step = 2;
          } else {
            this.FORM_STATE.step = 1;
          }
          if ( this.dialogData['forStaff'] ) {
            this.FORM_STATE.formMode.formFactor = FormFactor.Invitation;
          } else {
            this.FORM_STATE.formMode.formFactor = FormFactor.HallPass;
          }
        } else {
          this.FORM_STATE.formMode.formFactor = FormFactor.HallPass;
          if ( this.dialogData['forStaff'] ) {
            this.FORM_STATE.step = 2;
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
  }

  onNextStep(evt) {

    if (evt.step === 0 || evt.action === 'exit') {
      this.dialogRef.close(evt);
      return;
    } else {
      console.log('STEP EVENT ===>', evt);

      this.FORM_STATE = evt;
    }
    this.setFormSize();
  }

  setFormSize() {
    const form = this.elementRef.nativeElement.closest('.mat-dialog-container');
          if (form && this.FORM_STATE.step !== 4) {
            form.style.boxShadow = '0 2px 4px 0px rgba(0, 0, 0, 0.5)';
          }

    switch (this.FORM_STATE.step) {
        case 1:
          this.formSize.width =  `425px`;
          this.formSize.height =  `500px`;
          break;
        case 2:
          this.formSize.width =  `700px`;
          this.formSize.height =  `400px`;
          break;
        case 3:
          this.formSize.width =  `425px`;
          this.formSize.height =  `500px`;
          break;
        case 4:
          if (form) {
            form.style.boxShadow = 'none';
          }
          this.formSize.width =  `425px`;
          this.formSize.height =  this.FORM_STATE.formMode.role === 1 ? `451px` : '412px';
          break;
      }
  }
}
