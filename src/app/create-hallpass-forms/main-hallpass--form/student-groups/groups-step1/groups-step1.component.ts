import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Navigation} from '../../main-hall-pass-form.component';
import {StudentList} from '../../../../models/StudentList';
import {User} from '../../../../models/User';
import {UserService} from '../../../../services/user.service';

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
  @Output() createGroupEmit: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  // public selectedGroup: StudentList;
  // public selectedStudents: User[] = [];

  constructor(private userService: UserService) { }

  ngOnInit() {

    if (this.selectedGroup) {
      this.selectedStudents = this.selectedGroup.users;
    }

  }

  nextStep() {
    // console.log('SLECTED ====>', this.selectedStudents, this.selectedGroup);
    if (this.formState.forLater) {
        this.formState.step = 1;
        this.formState.fromState = 1;
    } else {
        this.formState.step = 3;
        this.formState.state = 1;
        this.formState.fromState = 1;
    }

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
    this.formState.state = 2;
    this.formState.step = 2;
    this.formState.fromState = 1;
    this.formState.data.selectedStudents = this.selectedStudents;
    this.createGroupEmit.emit(this.formState);
  }

  selectGroup(group, evt: Event) {

    if (!group) {
      this.selectedGroup = null;
    } else if ( !this.selectedGroup || (this.selectedGroup && (this.selectedGroup.id !== group.id)) ) {
      this.selectedGroup = group;
      this.selectedStudents = this.selectedGroup.users;
    } else {
      this.selectedGroup = null;
      this.selectedStudents = [];
    }
    evt.stopPropagation();

  }

  editGroup(group) {

    console.log(' GROUP ==================>', group);

    this.createGroupEmit.emit({
      step: 2,
      state: 3,
      fromState: 1,
      data: {
        selectedGroup: group
      }
    });
  }

  updateInternalData(evt) {
    this.formState.data.selectedGroup = null;
    this.selectedGroup = null;
    this.formState.data.selectedStudents = evt;
    this.formState.state = 1;
    this.userService.getStudentGroups()
        .subscribe((groups: StudentList[]) => {
            this.groups = groups;
        });
  }

  back() {
    if (this.selectedGroup) {
      this.selectedGroup = null;
      this.selectedStudents = [];
      return;
    } else {
      this.stateChangeEvent.emit('exit');
    }


  }
}


