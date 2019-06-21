import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { HttpService } from '../../services/http-service';
import { UserService } from '../../services/user.service';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {bumpIn} from '../../animations';
import {ProfileCardDialogComponent} from '../profile-card-dialog/profile-card-dialog.component';
import {Router} from '@angular/router';
import {GettingStartedProgressService} from '../getting-started-progress.service';

declare const history: History;

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  animations: [bumpIn]
})
export class AccountsComponent implements OnInit {

  splash: boolean;

  public accounts$ =
    new BehaviorSubject<any>({
      total_count: '-',
      gsuite_count: '-',
      alternative_count: '-',
      admin_count: '-',
      student_count: '-',
      teacher_count: '-',
      assistant_count: '-'
    });

  constructor(
    private userService: UserService,
    private http: HttpService,
    private adminService: AdminService,
    private router: Router,
    public darkTheme: DarkThemeSwitch,
    public matDialog: MatDialog,
    private gsProgress: GettingStartedProgressService
  ) {
    // this.splash = this.gsProgress.onboardProgress.setup_accounts && (!this.gsProgress.onboardProgress.setup_accounts.start || !this.gsProgress.onboardProgress.setup_accounts.end);
    this.splash = this.gsProgress.onboardProgress.setup_accounts && (!this.gsProgress.onboardProgress.setup_accounts.start);
    console.log(this.splash);
  }

  ngOnInit() {
    this.http.globalReload$.pipe(
      switchMap(() => this.adminService.getAdminAccounts())
    )
    .subscribe((u_list: any) => {
      if (u_list.total_count !== undefined) {
        u_list.total = u_list.total_count;
      } else {
        u_list.total = Object.values(u_list).reduce((a: number, b: number) => a + b);
      }
      console.log(u_list);
      this.accounts$.next(u_list);
    });
  }

  goToAccountsSetup() {
    this.router.navigate(['accounts_setup']);
    this.updateAcoountsOnboardProgress('start');
  }

  showAccountsSetupLink() {
    this.updateAcoountsOnboardProgress('start');
    const dialogRef = this.matDialog.open(ProfileCardDialogComponent, {
      panelClass: 'overlay-dialog',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '500px',
      data: {
        setupLink: true
      }
    });
  }
  private updateAcoountsOnboardProgress(ticket: 'start' | 'end') {
    if (ticket === 'start') {
      this.gsProgress.updateProgress('setup_accounts:start');
    } else if (ticket === 'end') {
      this.gsProgress.updateProgress('setup_accounts:end');
    }
  }
  showSettings() {

    const data = {
      bulkPermissions: null,
      gSuiteSettings: true,
    }

    const dialogRef = this.matDialog.open(ProfileCardDialogComponent, {
      panelClass: 'overlay-dialog',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '500px',
      data: data
    });

  }
}
