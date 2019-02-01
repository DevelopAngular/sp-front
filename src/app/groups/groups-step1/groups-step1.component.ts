import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../models/User';
import {StudentList} from '../../models/StudentList';
import {Navigation} from '../../hallpass-form/hallpass-form.component';

@Component({
  selector: 'app-groups-step1',
  templateUrl: './groups-step1.component.html',
  styleUrls: ['./groups-step1.component.scss']
})
export class GroupsStep1Component implements OnInit {

  @Input() selectedGroup: StudentList = null;
  @Input() selectedStudents: User[] = [];
  @Input() groups: StudentList[] = [];
  @Input() formState: Navigation;
  @Input() hasBackArrow: boolean = false;

  @Output() stateChangeEvent: EventEmitter<Navigation | string> = new EventEmitter<Navigation | string>();

  // public selectedGroup: StudentList;
  // public selectedStudents: User[] = [];

  constructor(
  ) { }

  ngOnInit() {

    if (this.selectedGroup) {
      this.selectedStudents = this.selectedGroup.users;
    }

  }

  nextStep() {
    // console.log('SLECTED ====>', this.selectedStudents, this.selectedGroup);

    this.formState.step = 3;
    this.formState.state = 1;
    this.formState.fromState = 1;

    if ( this.selectedGroup) {
      this.formState.data.selectedGroup = this.selectedGroup;
      this.formState.data.selectedStudents = this.selectedGroup.users;

    } else {
      this.formState.data.selectedGroup = null;
      this.formState.data.selectedStudents = this.selectedStudents;
    }



    this.stateChangeEvent.emit(this.formState);
  }

  createGroup() {
    this.stateChangeEvent.emit({
      step: 2,
      state: 2,
      fromState: 1,
      data: {
        selectedStudents: this.selectedStudents
      }
    });
  }


  selectGroup(group) {
    if ( !this.selectedGroup || (this.selectedGroup && (this.selectedGroup.id !== group.id)) ) {
      this.selectedGroup = group;
      this.selectedStudents = this.selectedGroup.users;
    } else {
      this.selectedGroup = null;
      this.selectedStudents = [];

    }
  }

  editGroup(group) {

    console.log(' GROUP ==================>', group);

    this.stateChangeEvent.emit({
      step: 2,
      state: 3,
      fromState: 1,
      data: {
        selectedGroup: group
      }
    });
  }

  updateInternalData(evt) {
    // if (this.selectedGroup) {
      this.formState.data.selectedGroup = null;
    // }
    this.formState.data.selectedStudents = evt;
    // this.stateChangeEvent.emit(
    //   {
    //     step: 2,
    //     state: 1,
    //     data: {
    //       selectedStudents: this.selectedStudents,
    //       selectedGroup: this.selectedGroup
    //     }
    //   }
    // );
  }

  back() {
    if (this.selectedGroup) {
      this.selectedGroup = null;
      this.selectedStudents = [];
      return;
    } else if (this.hasBackArrow) {
      this.formState.previousStep = 2;
      this.stateChangeEvent.emit({
        step: 1,
        // state: 1,
        // fromState: 1,
        data: {
          selectedStudents: this.selectedStudents,
          selectedGroup: this.selectedGroup
        }
      });
    } else {
      this.stateChangeEvent.emit('exit');
      // this.stateChangeEvent.emit({
      //   step: 0,
      //   // state: 1,
      //   // fromState: 1,
      //   data: {
      //     selectedStudents: this.selectedStudents,
      //     selectedGroup: this.selectedGroup
      //   }
      // });
    }


  }
}


