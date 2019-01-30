import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../models/User';
import {FormControl, FormGroup} from '@angular/forms';
import {StudentList} from '../../models/StudentList';
import {HttpService} from '../../http-service';
import {BehaviorSubject} from 'rxjs';
import {Navigation} from '../../hallpass-form/hallpass-form.component';

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
    private http: HttpService
  ) {

    this.states = States;

    this.groupDTO = new FormGroup({
      title: new FormControl(''),
      users: new FormControl(this.selectedStudents),
    });
  }

  ngOnInit() {
    this.updateData$.subscribe(() => {

      this.http.get('v1/student_lists')
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

    if ( evt.step === 3 || evt.step === 1 ) {
      // this.FORM_STATE.step = evt.step;
      this.FORM_STATE.step = this.FORM_STATE.previousStep && this.FORM_STATE.previousStep > 3 ? this.FORM_STATE.previousStep : evt.step ;
      this.FORM_STATE.previousStep = 2;
      this.FORM_STATE.state = 1;
      this.FORM_STATE.data.selectedGroup = evt.data.selectedGroup;
      this.FORM_STATE.data.selectedStudents = evt.data.selectedStudents;
      this.nextStepEvent.emit(this.FORM_STATE);
      return;
    }

    switch ( evt.state ) {
      case (3): {
        this.selectedGroup = evt.data.selectedGroup
        break;
      }
      case (2): {
        this.selectedStudents = evt.data.selectedStudents;
        this.groupDTO.get('users').setValue(evt.data.selectedStudents);
        break;
      }
      case (1): {
        if (evt.fromState === 3) {
          this.FORM_STATE.data.selectedGroup = evt.data.selectedGroup;
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
