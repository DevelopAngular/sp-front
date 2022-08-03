import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {DataService} from '../../services/data-service';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserService} from '../../services/user.service';

import {LocationsService} from '../../services/locations.service';
import {CreateFormService} from '../../create-hallpass-forms/create-form.service';
import {NextStep} from '../../animations';
import {User} from '../../models/User';
import {EncounterPreventionService} from '../../services/encounter-prevention.service';
import {ExclusionGroup} from '../../models/ExclusionGroup';
import {PassLimitStudentInfoComponent} from '../../pass-limit-student-info/pass-limit-student-info.component';
import {StudentPassLimit} from '../../models/HallPassLimits';
import {ViewProfileComponent} from './view-profile/view-profile.component';

@Component({
  selector: 'app-profile-card-dialog',
  templateUrl: './profile-card-dialog.component.html',
  styleUrls: ['./profile-card-dialog.component.scss'],
  animations: [NextStep]
})
export class ProfileCardDialogComponent implements OnInit {

  page = 1;
  frameMotion$: BehaviorSubject<any>;
  profile: User;
  exclusionGroups$: Observable<ExclusionGroup[]>;
  encounterGroupPage: string;
  currentExclusionGroup: ExclusionGroup;
  passLimitData: { studentPassLimit: StudentPassLimit, user: User };

  @ViewChild('passLimitStudentInfo') set bulkEditComp(comp: PassLimitStudentInfoComponent) {
    if (comp) {
      comp.data.studentPassLimit = this.data['profile']._originalUserProfile.limit as StudentPassLimit;
      comp.data.user = this.data['profile']._originalUserProfile;
    }
  }

  @ViewChild('viewProfile') set viewProfilePassLimit(comp: ViewProfileComponent) {
    if (comp) {
      comp.studentPassLimit = this.data['profile']._originalUserProfile.limit as StudentPassLimit;
    }
  }

  // TODO: Apply proper types to dialog data
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProfileCardDialogComponent>,
    private matDialog: MatDialog,
    private router: Router,
    private dataService: DataService,
    private userService: UserService,
    private locationService: LocationsService,
    private formService: CreateFormService,
    private encounterPreventionService: EncounterPreventionService
  ) {}

  ngOnInit() {
    this.profile = this.data['profile']._originalUserProfile;
    this.userService.user$.subscribe(user => {
      this.passLimitData = {
        studentPassLimit: this.data['profile']._originalUserProfile.limit as StudentPassLimit,
        user: user
      };
    });
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    if (User.fromJSON(this.profile).isStudent()) {
      this.encounterPreventionService.getExclusionGroupsRequest({student: this.profile.id});
    }
    this.exclusionGroups$ = this.encounterPreventionService.exclusionGroups$;
  }

  goToChangePassword(action) {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      if (action === 'password') {
        this.page = 2;
      }
    }, 100);
  }

  goToEncounterGroups({action, group}) {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      this.encounterGroupPage = action;
      if (action === 'newGroup') {
        this.page = 3;
      } else if (action === 'groupDescription') {
        this.page = 3;
        this.currentExclusionGroup = group;
      }
    }, 100);
  }

  goToPassLimits() {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      this.page = 4;
    }, 100);
  }

  goBack() {
    this.formService.setFrameMotionDirection('back');
    setTimeout(() => {
      this.page = 1;
    }, 100);
  }
}
