import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { DataService } from '../../data-service';
import { HttpService } from '../../http-service';
import { Location } from '../../models/Location';
import { Pinnable } from '../../models/Pinnable';
import { User } from '../../models/User';
import { StudentList } from '../../models/StudentList';

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
    date?: any;
    selectedStudents?: User[];
    selectedGroup?: StudentList;
    direction?: {
      from?: Location;
      to?: Location;
      pinnable?: Pinnable;
      // restricted?: boolean;
    },
    icon?: string
    gradient?: string;
    message?: string,
    requestTarget?: User,
    hasClose?: boolean
  };
  forInput?: boolean;
  forLater?: boolean;
}



@Component({
  selector: 'app-main-hallpass-form',
  templateUrl: './main-hall-pass-form.component.html',
  styleUrls: ['./main-hall-pass-form.component.scss']
})
export class MainHallPassFormComponent implements OnInit {

  public FORM_STATE: Navigation;
  public animateNextStep: number;
  public animatePrevStep: number;
  public stepTransition: Object = {
    'state-transition__left-right': false,
    'state-transition__right-left': false
  };

  constructor(
    private http: HttpService,
    private dataService: DataService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<MainHallPassFormComponent>,
  ) {}

  ngOnInit() {
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
        direction: {},

      },
      forInput: this.dialogData['forInput'] || false,
      forLater: this.dialogData['forLater']
    };
    switch (this.dialogData['forInput']) {
      case (true): {
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
            // this.FORM_STATE.state = 1;
          } else {
            this.FORM_STATE.step = 3;
            // this.FORM_STATE.state = 1;
          }
        }
        break;
      }
      case (false): {
        if (this.dialogData['hasClose']) {
         this.FORM_STATE.data.hasClose = true;
        }
        this.FORM_STATE.formMode.formFactor = FormFactor.Request;
        this.FORM_STATE.formMode.role = this.dialogData['isDeny'] ? Role.Teacher : Role.Student;
        this.FORM_STATE.step = this.dialogData['entryState'].step;
        this.FORM_STATE.state = this.dialogData['entryState'].state;
        this.FORM_STATE.data.date = {
          date: this.dialogData['request_time']
        };
        this.FORM_STATE.data.requestTarget = this.dialogData['teacher'];
        this.FORM_STATE.data.gradient = this.dialogData['gradient'];
        this.FORM_STATE.data.direction = {
          from: this.dialogData['originalFromLocation'],
          to: this.dialogData['originalToLocation']
        };

        break;
      }
    }

  }

  onNextStep(evt) {
    if (evt.step === 0 || evt.action === 'exit') {
      console.log('EXIT ===>', evt);
      this.dialogRef.close(evt);
      return;
    } else {
      console.log('STEP EVENT ===== ===>', evt);

      this.stepTransition['state-transition__left-right'] = this.FORM_STATE.previousStep < this.FORM_STATE.step;
      this.stepTransition['state-transition__right-left'] = this.FORM_STATE.previousStep > this.FORM_STATE.step;
      this.FORM_STATE = evt;
    }
  }
}