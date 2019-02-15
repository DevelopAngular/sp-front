import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../../../models/User';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {StudentList} from '../../../../models/StudentList';
import {BehaviorSubject} from 'rxjs';
import {Navigation} from '../../main-hall-pass-form.component';
import {UserService} from '../../../../services/user.service';

export enum States {
  SelectStudents = 1,
  CreateGroup = 2,
  EditGroup = 3
}

@Component({
  selector: 'app-groups-container',
  templateUrl: './groups-container.component.html',
  styleUrls: ['./groups-container.component.scss']
})

export class GroupsContainerComponent implements OnInit {

  @Input() FORM_STATE: Navigation;
  @Output() nextStepEvent: EventEmitter<Navigation | { action: string, data: any }> = new EventEmitter<Navigation | { action: string, data: any } >();

  updateData$: BehaviorSubject<null> = new BehaviorSubject<null>(null);
  states;
  currentState: number = 1;
  selectedGroup: StudentList = null;
  groups: StudentList[];
  selectedStudents: User[] = [];
  groupDTO: FormGroup;


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
    this.updateData$.subscribe(() => {

      this.userService.getStudentGroups()
        .subscribe((groups: StudentList[]) => {
          this.groups = groups;
        });
    });
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
        case (3): {
            this.selectedGroup = evt.data.selectedGroup;
            break;
        }
        case (2): {
            this.selectedStudents = evt.data.selectedStudents;
            this.groupDTO.get('users').setValue(evt.data.selectedStudents);
            break;
        }
        case (1): {
            if (evt.fromState === 3) {
                this.FORM_STATE.data.selectedGroup = this.groups.find(group => group.id === evt.data.selectedGroup.id);
            } else {
                this.selectedStudents = evt.data.selectedStudents;
            }
            break;
        }
    }
    this.currentState = evt.state;
    this.updateData$.next(null);
  }
}
