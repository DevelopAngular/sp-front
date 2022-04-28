import {Component, Inject, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ScreenService} from '../../services/screen.service';
import {CreateFormService} from '../../create-hallpass-forms/create-form.service';
import {PassLimitService} from '../../services/pass-limit.service';
import {NextStep} from '../../animations';
import {User} from '../../models/User';
import {Router} from '@angular/router';
import {UserService} from '../../services/user.service';
import {take} from 'rxjs/operators';

// TODO: Create some sort of API/service for dialogs that have multiple pages

@Component({
  selector: 'app-pass-limits-dialog',
  templateUrl: './pass-limits-dialog.component.html',
  styleUrls: ['./pass-limits-dialog.component.scss'],
  animations: [NextStep]
})
export class PassLimitsDialogComponent implements OnInit {
  pageNumber = 1;
  frameMotion$: BehaviorSubject<any>;
  passLimitToggleTooltip = `Some help text about pass limits`; // TODO: Get text for this
  canNavigate: boolean;

  constructor(
    public dialogRef: MatDialogRef<PassLimitsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { profile: User },
    public screenService: ScreenService,
    private formService: CreateFormService,
    private passLimit: PassLimitService,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.userService.user$.pipe(take(1)).subscribe(user => {
      this.canNavigate = user.roles.includes('manage_school');
    });
  }

  navigateToAdminPage() {
    this.dialogRef.close();
    this.router.navigateByUrl('/admin/accounts/_profile_student');
  }
}
