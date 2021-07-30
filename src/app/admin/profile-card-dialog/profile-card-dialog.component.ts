import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '../../services/data-service';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../services/user.service';

import { LocationsService } from '../../services/locations.service';
import { CreateFormService } from '../../create-hallpass-forms/create-form.service';
import { NextStep } from '../../animations';
import { User } from '../../models/User';

@Component({
  selector: 'app-profile-card-dialog',
  templateUrl: './profile-card-dialog.component.html',
  styleUrls: ['./profile-card-dialog.component.scss'],
  animations: [NextStep]
})
export class ProfileCardDialogComponent implements OnInit {

  page: number = 1;
  frameMotion$: BehaviorSubject<any>;
  profile: User;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProfileCardDialogComponent>,
    private matDialog: MatDialog,
    private router: Router,
    private dataService: DataService,
    private userService: UserService,
    private locationService: LocationsService,
    private formService: CreateFormService
  ) {}

  ngOnInit() {
    this.profile = this.data['profile']._originalUserProfile;
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  goToChangePassword() {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      this.page = 2;
    }, 100);
  }

  goBack() {
    this.formService.setFrameMotionDirection('back');
    setTimeout(() => {
      this.page = 1;
    }, 100);
  }
}
