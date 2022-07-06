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
import {HallPassLimit} from '../../models/HallPassLimits';

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
  canNavigate: boolean;

  constructor(
    public dialogRef: MatDialogRef<PassLimitsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { profile: User, passLimit: HallPassLimit },
    public screenService: ScreenService,
    private formService: CreateFormService,
    private passLimit: PassLimitService,
    private router: Router,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.userService.user$.pipe(take(1)).subscribe(user => {
      this.canNavigate = user.roles.includes('manage_school');
    });
  }

  navigateToAdminPage() {
    this.dialogRef.close();
    const urlTree = this.router.createUrlTree(
      ['admin', 'accounts', '_profile_student'],
      {queryParams: {'pass-limits': ''}}
    );
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }
}
