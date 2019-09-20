import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {User} from '../../../../models/User';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {StudentList} from '../../../../models/StudentList';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {Navigation} from '../../main-hall-pass-form.component';
import {UserService} from '../../../../services/user.service';
import {delay, filter, map, switchMap, takeUntil} from 'rxjs/operators';

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


  constructor(
    private userService: UserService
  ) {

    this.states = States;
    this.groupDTO = new FormGroup({
      title: new FormControl('', {updateOn: 'change'}),
      users: new FormControl(this.selectedStudents, {updateOn: 'change'}),
    });
  }


  ngOnInit() {
    if (this.FORM_STATE) {

      this.currentState = this.FORM_STATE.state || 1;
    }

    // this.userService.getStudentGroupsRequest().pipe(
    //   takeUntil(this.destoy$)
    // ).subscribe(res => {
    //   this.groups = res;
    // });

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

  onStateChange(evt) {
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

    if ( evt.step === 3 || evt.step === 1 ) {
      // this.FORM_STATE.step = evt.step;
      this.FORM_STATE.step = this.FORM_STATE.previousStep && this.FORM_STATE.previousStep > 3 ? this.FORM_STATE.previousStep : evt.step ;
      this.FORM_STATE.previousStep = 2;
      this.FORM_STATE.state = this.FORM_STATE.formMode.formFactor === 3 ? 2 : 1;
      this.FORM_STATE.data.selectedGroup = evt.data.selectedGroup;
      this.FORM_STATE.data.selectedStudents = evt.data.selectedStudents;
      this.nextStepEvent.emit(this.FORM_STATE);
      return;
    }
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

}
