import {Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {User} from '../../../../models/User';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {StudentList} from '../../../../models/StudentList';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {Navigation} from '../../main-hall-pass-form.component';
import {UserService} from '../../../../services/user.service';
import {delay, filter, map, pluck, switchMap, takeUntil} from 'rxjs/operators';
import {CreateFormService} from '../../../create-form.service';
import {ScreenService} from '../../../../services/screen.service';
import {KeyboardShortcutsService} from '../../../../services/keyboard-shortcuts.service';
import {DeviceDetection} from '../../../../device-detection.helper';
import {FromWhereComponent} from '../../locations-group-container/from-where/from-where.component';
import {ToWhereComponent} from '../../locations-group-container/to-where/to-where.component';
import {ToCategoryComponent} from '../../locations-group-container/to-category/to-category.component';
import {RestrictedTargetComponent} from '../../locations-group-container/restricted-target/restricted-target.component';
import {RestrictedMessageComponent} from '../../locations-group-container/restricted-message/restricted-message.component';
import {GroupsStep1Component} from '../groups-step1/groups-step1.component';
import {GroupsStep2Component} from '../groups-step2/groups-step2.component';
import {GroupsStep3Component} from '../groups-step3/groups-step3.component';
import {WhoYouAreComponent} from '../who-you-are/who-you-are.component';

export enum States {
  SelectStudents = 1,
  CreateGroup = 2,
  EditGroup = 3,
  WhoAreYou = 4,
}

@Component({
  selector: 'app-groups-container',
  templateUrl: './groups-container.component.html',
  styleUrls: ['./groups-container.component.scss']
})

export class GroupsContainerComponent implements OnInit, OnDestroy {

  @ViewChild(GroupsStep1Component) g1;
  @ViewChild(GroupsStep2Component) g2;
  @ViewChild(GroupsStep3Component) g3;
  @ViewChild(WhoYouAreComponent) whoYouAre;

  @Input() FORM_STATE: Navigation;

  @Output() nextStepEvent: EventEmitter<Navigation | { action: string, data: any }> = new EventEmitter<Navigation | { action: string, data: any } >();

  updateData$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  states;
  currentState: number;
  selectedGroup: StudentList = null;
  groups: StudentList[];
  selectedStudents: User[] = [];
  groupDTO: FormGroup;

  destoy$ = new Subject();

  frameMotion$: BehaviorSubject<any>;

  constructor(
    private userService: UserService,
    private formService: CreateFormService,
    private screenService: ScreenService,
    private shortcutsService: KeyboardShortcutsService
  ) {

    this.states = States;
    this.groupDTO = new FormGroup({
      title: new FormControl('', {updateOn: 'change'}),
      users: new FormControl(this.selectedStudents, {updateOn: 'change'}),
    });
  }

  get pwaBackBtnVisibility() {
    return this.screenService.isDeviceLargeExtra;
  }
  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

  ngOnInit() {

    this.checkCompresingAbbility();

    if (this.FORM_STATE) {
      this.currentState = this.FORM_STATE.state || 1;
    }

    this.updateData$.pipe(
      switchMap((evt) => {
        return this.userService.getStudentGroupsRequest().pipe(
          map((groups: StudentList[]) => {
            this.groups = groups;
            return evt;
          })
        );
      }),
      filter(evt => evt)
    )
    .subscribe((evt: any) => {
      if (evt.fromState === 3 && evt.data.selectedGroup) {
        this.selectedGroup = this.groups.find(group => group.id === evt.data.selectedGroup.id);
        this.FORM_STATE.data.selectedGroup = this.selectedGroup;
        this.FORM_STATE.data.selectedStudents = this.selectedGroup.users;
        this.groupDTO.get('users').setValue(this.selectedGroup.users);
      } else {
        this.selectedStudents = evt.data.selectedStudents;
      }
    });
  }

  ngOnDestroy(): void {
    this.destoy$.next();
    this.destoy$.complete();
  }

  private checkCompresingAbbility() {
    if (!this.screenService.isDeviceLargeExtra && !this.FORM_STATE.kioskMode) {
      this.formService.compressableBoxController.next(true);
    }
  }

  onStateChange(evt) {
    this.checkCompresingAbbility();
    setTimeout(() => {
      if ( evt === 'exit' ) {
        this.nextStepEvent.emit({ action: 'exit', data: null });
        return;
      }

      if (this.FORM_STATE.quickNavigator) {
          this.FORM_STATE.step = this.FORM_STATE.previousStep;
          this.FORM_STATE.state = this.FORM_STATE.previousState;
          this.FORM_STATE.previousStep = 2;
          return this.nextStepEvent.emit(this.FORM_STATE);
      }

      if ( evt.step === 3 && this.FORM_STATE.kioskMode) {
        this.selectedStudents = evt.data.selectedStudents;
        this.groupDTO.get('users').setValue(evt.data.selectedStudents);

        this.FORM_STATE.step = 3 ;
        this.FORM_STATE.state = 2;
        this.FORM_STATE.previousStep = 2;
        this.FORM_STATE.fromState = 4;

        this.FORM_STATE.data.selectedStudents = evt.data.selectedStudents;
        this.nextStepEvent.emit(this.FORM_STATE);
      }

      if ( (evt.step === 3 || evt.step === 1) && !this.FORM_STATE.kioskMode) {
        this.FORM_STATE.step = this.FORM_STATE.previousStep && this.FORM_STATE.previousStep > 3 ? this.FORM_STATE.previousStep : evt.step ;
        this.FORM_STATE.previousStep = 2;
        this.FORM_STATE.state = this.FORM_STATE.formMode.formFactor === 3 ? 2 : 1;
        this.FORM_STATE.data.selectedGroup = evt.data.selectedGroup;
        this.FORM_STATE.data.selectedStudents = evt.data.selectedStudents;
        this.nextStepEvent.emit(this.FORM_STATE);
        return;
      }
    }, 100);
  }

  groupNextStep(evt) {

    switch (evt.state) {
      case 3:
        this.selectedGroup = evt.data.selectedGroup;
        // this.selectedStudents = evt.data.selectedStudents;
        break;
      case 2:
        this.selectedStudents = evt.data.selectedStudents;
        this.groupDTO.get('users').setValue(evt.data.selectedStudents);
        break;
      case 1:
        this.updateData$.next(evt);
        break;
    }
    this.currentState = evt.state;
  }

  stepBack() {
    // debugger
    switch (this.FORM_STATE.state) {
      case 1:
        this.g1.back();
        this.nextStepEvent.emit(this.FORM_STATE);
        break;
      case 2:
        if (this.g2) {
          this.g2.back();
        }
        break;
      case 3:
        if (this.g3) {
          this.g3.back();
        }
        break;
      case 4:
        if (this.whoYouAre) {
          this.whoYouAre.back();
        }
        break;
    }
  }

}
