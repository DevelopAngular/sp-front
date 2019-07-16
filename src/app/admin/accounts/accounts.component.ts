import {Component, ElementRef, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material';
import { HttpService } from '../../services/http-service';
import { UserService } from '../../services/user.service';
import {BehaviorSubject, Observable, of, Subject, zip} from 'rxjs';
import {mapTo, switchMap} from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {bumpIn} from '../../animations';
import {ProfileCardDialogComponent} from '../profile-card-dialog/profile-card-dialog.component';
import {Router} from '@angular/router';
import {Util} from '../../../Util';
import {User} from '../../models/User';
import {StorageService} from '../../services/storage.service';
import {ColumnsConfigDialogComponent} from '../columns-config-dialog/columns-config-dialog.component';
import {TABLE_RELOADING_TRIGGER} from '../accounts-role/accounts-role.component';
import {ConsentMenuComponent} from '../../consent-menu/consent-menu.component';
import {GettingStartedProgressService} from '../getting-started-progress.service';
import {AddUserDialogComponent} from '../add-user-dialog/add-user-dialog.component';
import {GSuiteOrgs} from '../../models/GSuiteOrgs';
import {encode} from 'punycode';
import {environment} from '../../../environments/environment';

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

  user: User;

  openTable: boolean;

  userList;
  selectedUsers = [];

  gSuiteOrgs: GSuiteOrgs = <GSuiteOrgs>{};

  dataTableHeaders;
  dataTableHeadersToDisplay: any[] = [];
  public dataTableEditState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public pending$: Subject<boolean> = new Subject<boolean>();


  public accountsButtons = [
      { title: 'Admins', param: '_profile_admin',  leftIcon: './assets/Admin (Navy).svg', subIcon: './assets/Info (Blue-Gray).svg', role: 'admin' },
      { title: 'Teachers', param: '_profile_teacher', leftIcon: './assets/Teacher (Navy).svg', subIcon: './assets/Info (Blue-Gray).svg', role: 'teacher' },
      { title: 'Assistants', param: '_profile_assistant', leftIcon: './assets/Assistant (Navy).svg', subIcon: './assets/Info (Blue-Gray).svg', role: 'assistant' },
      { title: 'Students', param: '_profile_student', leftIcon: './assets/Student (Navy).svg', subIcon: './assets/Info (Blue-Gray).svg', role: 'student' }
  ];

  constructor(
    private userService: UserService,
    private http: HttpService,
    private adminService: AdminService,
    public router: Router,
    public darkTheme: DarkThemeSwitch,
    private storage: StorageService,
    public matDialog: MatDialog,
    private gsProgress: GettingStartedProgressService,
  ) {}

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  ngOnInit() {

   this.adminService.getGSuiteOrgs().subscribe(res => this.gSuiteOrgs = res);
    this.http.globalReload$.pipe(
      switchMap(() => this.adminService.getAdminAccounts())
    )
    .subscribe((u_list: any) => {
      this.splash = this.gsProgress.onboardProgress.setup_accounts && (!this.gsProgress.onboardProgress.setup_accounts.start || !this.gsProgress.onboardProgress.setup_accounts.end);
      if (u_list.total_count !== undefined) {
        u_list.total = u_list.total_count;
      } else {
        u_list.total = Object.values(u_list).reduce((a: number, b: number) => a + b);
      }
      console.log(u_list);
      this.accounts$.next(u_list);
    });

    this.splash = this.gsProgress.onboardProgress.setup_accounts && (!this.gsProgress.onboardProgress.setup_accounts.start || !this.gsProgress.onboardProgress.setup_accounts.end);


    this.userService.userData.subscribe((user) => {
      this.user = user;
    });

    const headers = this.storage.getItem(`_all_columns`);
    if ( headers ) {
      this.dataTableHeaders = JSON.parse(headers);
      if (!this.dataTableHeaders['Account Type']) {
        this.dataTableHeaders['Account Type'] = {
          value: true,
            label: 'Account Type',
            disabled: false
        };
      }
    } else {
      this.dataTableHeaders = {
        'Name': {
          value: true,
          label: 'Name',
          disabled: true
        },
        'Email/Username': {
          value: true,
          label: 'Email/Username',
          disabled: true
        },
        'Account Type': {
          value: true,
          label: 'Account Type',
          disabled: false
        },
        'Profile(s)': {
          value: true,
          label: 'Profile(s)',
          disabled: false
        }
      };
    }

    this.getUserList();

    TABLE_RELOADING_TRIGGER.subscribe((updatedHeaders) => {
        this.dataTableHeaders = updatedHeaders;
        this.getUserList();
    });
  }

  addUser() {
      const DR = this.matDialog.open(AddUserDialogComponent,
          {
              width: '425px', height: '500px',
              panelClass: 'accounts-profiles-dialog',
              backdropClass: 'custom-bd',
              data: {
                  role: '_all',
              }
      });
  }

  getCountRole(role: string) {
    if (role === 'admin') {
      return this.accounts$.value.admin_count;
    } else if (role === 'teacher') {
      return this.accounts$.value.teacher_count;
    } else if (role === 'assistant') {
      return this.accounts$.value.assistant_count;
    } else if (role === 'student') {
      return this.accounts$.value.student_count;
    }
  }

    findProfileByRole(evt) {
      setTimeout(() => {
         this.router.navigate(['admin/accounts', evt.role], {queryParams: {profileName: evt.row['Name']}});
      }, 250);
    }

    setSelected(e) {
      this.selectedUsers = e;
    }

    findRelevantAccounts(search) {
      this.getUserList(search);
    }

    promptConfirmation(eventTarget: HTMLElement, option: string = '') {

        if (!eventTarget.classList.contains('button')) {
            (eventTarget as any) = eventTarget.closest('.button');
        }

        eventTarget.style.opacity = '0.75';
        let header: string;
        let options: any[];

        const consentMenuObserver = (res) => {
            console.log(res);
            if (res) {
                this.http.setSchool(this.http.getSchool());
                this.selectedUsers = [];
                this.getUserList();
            }
        }


        switch (option) {
            case 'delete_from_profile':
                header = `Are you sure you want to permanently delete ${this.selectedUsers.length > 1 ? 'these accounts' : 'this account'} and all associated data? This cannot be undone.`;
                options = [{display: `Confirm Delete`, color: '#DA2370', buttonColor: '#DA2370, #FB434A', action: 'delete_from_profile'}];
                break;
        }
        const DR = this.matDialog.open(ConsentMenuComponent,
            {
                data: {
                    role: '_all',
                    selectedUsers: this.selectedUsers,
                    restrictions: false,
                    header: header,
                    options: options,
                    trigger: new ElementRef(eventTarget)
                },
                panelClass: 'consent-dialog-container',
                backdropClass: 'invis-backdrop',
            });
        DR.afterClosed()
            .pipe(
                switchMap((action): Observable<any> => {
                    console.log(action);
                    eventTarget.style.opacity = '1';

                    switch (action) {
                        case 'delete_from_profile':
                           return zip(...this.selectedUsers.map((user) => this.userService.deleteUser(user['id']))).pipe(mapTo(true));
                            break;
                        default:
                            return of(false);
                            break;
                    }
                }),
            )
            .subscribe(consentMenuObserver);
    }

    private getUserList(search = '') {
      this.userList = [];
        this.pending$.next(true);
      // this.http.globalReload$.pipe(switchMap(() => {
      //   return this.userService.getUsersList('', search);
      // }))
      this.userService.getUsersList('', search).subscribe(users => {
            this.dataTableHeadersToDisplay = [];
              this.userList = this.buildUserListData(users);
            this.pending$.next(false);

          });
    }

    private buildUserListData(userList) {
        return userList.map((raw, index) => {
            const partOf = [];
            if (raw.roles.includes('_profile_student')) partOf.push({title: 'Student', role: '_profile_student'});
            if (raw.roles.includes('_profile_teacher')) partOf.push({title: 'Teacher', role: '_profile_teacher'});
            if (raw.roles.includes('_profile_assistant')) partOf.push({title: 'Assistant', role: '_profile_assistant'});
            if (raw.roles.includes('_profile_admin')) partOf.push({title: 'Administrator', role: '_profile_admin'});

            const rawObj = {
                'Name': raw.display_name,
                'Email/Username': (/@spnx.local/).test(raw.primary_email) ? raw.primary_email.slice(0, raw.primary_email.indexOf('@spnx.local')) : raw.primary_email,
                'Account Type': raw.sync_types[0] === 'google' ? 'G Suite' : 'Standard',
                'Profile(s)': partOf.length ? partOf : [{title: 'No profile'}],

            };
            for (const key in rawObj) {
                if (!this.dataTableHeaders[key]) {
                    delete rawObj[key];
                }
                if (index === 0) {
                    if (this.dataTableHeaders[key] && this.dataTableHeaders[key].value) {
                        this.dataTableHeadersToDisplay.push(key);
                    }
                }
            }
            Object.defineProperty(rawObj, 'id', { enumerable: false, value: raw.id });
            Object.defineProperty(rawObj, 'me', { enumerable: false, value: +raw.id === +this.user.id });
            Object.defineProperty(rawObj, '_originalUserProfile', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: raw
            });
            return  rawObj;
        });
    }

  showColumnSettings(evt: Event) {
      this.matDialog.open(ColumnsConfigDialogComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: {
              'trigger': evt.currentTarget,
              'form': this.dataTableHeaders,
              'role': '_all'
          }
      });
  }

  goToAccountsSetup() {
    this.updateAcoountsOnboardProgress('start');
    this.adminService
      .getAccountSyncLink(+this.http.getSchool().id)
      .subscribe((link: {authorization_url: string}) => {

        this.router.navigate(['accounts_setup'], { queryParams: { googleAuth: link.authorization_url } });
      });

  }

  showAccountsSetupLink() {
    this.updateAcoountsOnboardProgress('start');
    this.pending$.next(true);
    this.adminService
      .getAccountSyncLink(+this.http.getSchool().id)
      .pipe(
        switchMap((link: {authorization_url: string}) => {
          const dialogRef = this.matDialog.open(ProfileCardDialogComponent, {
            panelClass: 'overlay-dialog',
            backdropClass: 'custom-bd',
            width: '425px',
            height: '500px',
            data: {
              setupLink: `${window.location.origin}/${environment.production ? 'app/' : ''}accounts_setup?googleAuth=${encodeURIComponent(link.authorization_url)}`,
            }
          });
          return dialogRef.afterClosed();
        })
      )
      .subscribe(() => {
        this.pending$.next(false);
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
