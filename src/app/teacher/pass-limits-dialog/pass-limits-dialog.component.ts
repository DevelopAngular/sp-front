import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';

import {concatMap, take} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatTabGroup} from '@angular/material/tabs';

import {PassLimitService} from '../../services/pass-limit.service';
import {User} from '../../models/User';
import {UserService} from '../../services/user.service';
import {HallPassLimit, IndividualPassLimit} from '../../models/HallPassLimits';

// TODO: Create some sort of API/service for dialogs that have multiple pages

@Component({
  selector: 'app-pass-limits-dialog',
  templateUrl: './pass-limits-dialog.component.html',
  styleUrls: ['./pass-limits-dialog.component.scss']
})
export class PassLimitsDialogComponent implements OnInit {
  canNavigate: boolean;
  @ViewChild('tabGroup') dialogPages: MatTabGroup;

  constructor(
    public dialogRef: MatDialogRef<PassLimitsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { profile: User, schoolPassLimit: HallPassLimit, individualLimit: IndividualPassLimit },
    private passLimitService: PassLimitService,
    private router: Router,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    console.log(this.data);
    this.userService.user$.pipe(take(1)).subscribe(user => {
      this.canNavigate = user.roles.includes('manage_school');
    });
  }

  navigateToAdminPage() {
    this.dialogRef.close();
    const urlTree = this.router.createUrlTree(
      ['app', 'admin', 'accounts', '_profile_student'],
      {queryParams: {'pass-limits': ''}}
    );
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }

  private goToPage(pageNumber: number) {
    if (pageNumber < 1) {
      throw new Error('Page Numbers cannot be less than 1');
    }
    this.dialogPages.selectedIndex = pageNumber - 1;
  }

  goToIndividualLimitPage() {
    this.goToPage(2);
  }

  goToHomePage() {
    this.goToPage(1);
  }
}
