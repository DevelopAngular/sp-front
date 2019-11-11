import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material';
import { HttpService } from '../../services/http-service';
import { UserService } from '../../services/user.service';
import {BehaviorSubject, Observable, of, Subject, zip} from 'rxjs';
import {filter, map, mapTo, mergeAll, switchMap, takeUntil, tap} from 'rxjs/operators';
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
import {environment} from '../../../environments/environment';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {wrapToHtml} from '../helpers';
import {UNANIMATED_CONTAINER} from '../../consent-menu-overlay';

import { isNull } from 'lodash';
import {LocationsService} from '../../services/locations.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  animations: [bumpIn]
})
export class AccountsComponent implements OnInit, OnDestroy {

  splash: boolean;

  countAccounts$: Observable<number> = this.userService.countAccounts$.all;

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

  destroy$ = new Subject();

  gSuiteOrgs: GSuiteOrgs = <GSuiteOrgs>{};

  querySubscriber$ = new Subject();

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
    private domSanitizer: DomSanitizer,
    private locationService: LocationsService
  ) {}

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  ngOnInit() {

    this.querySubscriber$.pipe(
      mergeAll(),
      filter((res: any[]) => !!res.length),
      takeUntil(this.destroy$)
    ).subscribe(users => {
      this.dataTableHeadersToDisplay = [];
      this.userList = this.buildUserListData(users);
      this.pending$.next(false);
    });

   this.adminService.getGSuiteOrgs().pipe(takeUntil(this.destroy$)).subscribe(res => this.gSuiteOrgs = res);

    this.http.globalReload$.pipe(
      takeUntil(this.destroy$),
      tap(() => this.querySubscriber$.next(this.getUserList())),
      switchMap(() => {
        return this.adminService.getCountAccountsRequest()
            .pipe(
              filter(list => !isNull(list.profile_count) && !isNull(list.student_count))
            );
        }
      ),
      switchMap((u_list: any) => {
        this.buildCountData(u_list);
        return this.gsProgress.onboardProgress$;
      }),
    )
    .subscribe((op: any) => {
      this.splash = op.setup_accounts && (!op.setup_accounts.start.value || !op.setup_accounts.end.value);
    });


    this.userService.userData.pipe(
      takeUntil(this.destroy$))
      .subscribe((user) => {
      this.user = user;
    });

    const headers = this.storage.getItem(`_all_columns`);
    if ( headers ) {
      this.dataTableHeaders = JSON.parse(headers);

      /**
       * Fallbacks for case if the user has old cached headers
       * */

      if (!this.dataTableHeaders['Account Type']) {
        this.dataTableHeaders['Account Type'] = {
          value: true,
            label: 'Account Type',
            disabled: false
        };
      }
      if (this.dataTableHeaders['Profile(s)'] || !this.dataTableHeaders['Group(s)']) {
        delete this.dataTableHeaders['Profile(s)'];
        this.dataTableHeaders['Group(s)'] = {
          value: true,
          label: 'Group(s)',
          disabled: false
        };
      }

      /**
       * End
       * */


    } else {
      this.dataTableHeaders = {
        'Name': {
          index: 0,
          value: true,
          label: 'Name',
          disabled: true
        },
        'Email/Username': {
          index: 1,
          value: true,
          label: 'Email/Username',
          disabled: true
        },
        'Account Type': {
          index: 2,
          value: true,
          label: 'Account Type',
          disabled: false
        },
        'Group(s)': {
          index: 3,
          value: true,
          label: 'Group(s)',
          disabled: false
        }
      };
    }

    TABLE_RELOADING_TRIGGER.subscribe((updatedHeaders) => {
      this.querySubscriber$.next(this.userService.accounts.allAccounts);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildCountData(u_list) {
    if (u_list.total_count !== undefined) {
      u_list.total = u_list.total_count;
    } else {
      u_list.total = Object.values(u_list).reduce((a: number, b: number) => a + b);
    }
    this.accounts$.next(u_list);
  }

  addUser() {
    const DR = this.matDialog.open(AddUserDialogComponent, {
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
    if (evt.name && evt.role) {
      setTimeout(() => {
         this.router.navigate(['admin/accounts', evt.role], {queryParams: {profileName: evt.name}});
      }, 250);
    }
  }

  prepareData(evt, bulk = false) {
    const role = evt._originalUserProfile.roles.includes('_profile_teacher') ? '_profile_teacher' :
      evt._originalUserProfile.roles.includes('_profile_admin') ? '_profile_admin' :
        evt._originalUserProfile.roles.includes('_profile_assistant') ? '_profile_assistant' : '_profile_student';

    const profileTitle =
      role === '_profile_admin' ? 'administrator' :
        role === '_profile_teacher' ? 'teacher' :
          role === '_profile_assistant' ? 'assistant' : 'student';

    const profilePermissions: any =
      role === '_profile_admin'
        ?
        {
          'access_admin_dashboard': {
            controlName: 'access_admin_dashboard',
            controlLabel: 'Dashboard Tab Access',
          },
          'access_hall_monitor': {
            controlName: 'access_hall_monitor',
            controlLabel: 'Hall Monitor Tab Access',
          },
          'access_admin_search': {
            controlName: 'access_admin_search',
            controlLabel: 'Search Tab Access',
          },
          'access_user_config': {
            controlName: 'access_user_config',
            controlLabel: 'Accounts Tab Access',
          },
          'access_pass_config': {
            controlName: 'access_pass_config',
            controlLabel: 'Rooms Tab Access',
          },
        }
        :
        role === '_profile_teacher'
          ?
          {
            'access_hall_monitor': {
              controlName: 'access_hall_monitor',
              controlLabel: 'Access to Hall Monitor'
            },
          }
          :
          role === '_profile_assistant'
            ?
            {
              'access_passes': {
                controlName: 'access_passes',
                controlLabel: 'Passes Tab Access'
              },
              'access_hall_monitor': {
                controlName: 'access_hall_monitor',
                controlLabel: 'Hall Monitor Tab Access'
              },
              'access_teacher_room': {
                controlName: 'access_teacher_room',
                controlLabel: 'My Room Tab Access'
              },
            }
            :
            {};

    if (role === '_profile_admin') {
      profilePermissions['access_user_config'].disabled = (evt.id === +this.user.id);
    }

      const data = {
        profile: evt,
        profileTitle: profileTitle,
        bulkPermissions: null,
        role,
        allAccounts: true,
        permissions: profilePermissions
      };
      if (bulk && this.selectedUsers.length) {
        data.bulkPermissions = this.selectedUsers;
      }
      this.showProfileCard(data);
  }

  showProfileCard(data) {

    const dialogRef = this.matDialog.open(ProfileCardDialogComponent, {
      panelClass: 'overlay-dialog',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '500px',
      data: data,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe((userListReloadTrigger: any) => {
        // if (userListReloadTrigger) {
        //   if (data.profile.id === +this.user.id) {
        //     this.userService.getUserRequest()
        //       .pipe(
        //         filter(res => !!res),
        //         map(raw => User.fromJSON(raw))
        //       )
        //       .subscribe((user) => {
        //         this.userService.userData.next(user);
        //       });
        //
        //   }
        //   this.selectedUsers = [];
        // }
        this.querySubscriber$.next(this.userService.accounts.allAccounts);
      });
  }

    setSelected(e) {
      this.selectedUsers = e;
    }

    findRelevantAccounts(search) {
      this.querySubscriber$.next(this.getUserList(search));
    }

    promptConfirmation(eventTarget: HTMLElement, option: string = '') {

      if (!eventTarget.classList.contains('button')) {
        (eventTarget as any) = eventTarget.closest('.button');
      }

      eventTarget.style.opacity = '0.75';
      let header: string;
      let options: any[];

      switch (option) {
        case 'delete_from_profile':
          header = `Are you sure you want to permanently delete ${this.selectedUsers.length > 1 ? 'these accounts' : 'this account'} and all associated data? This cannot be undone.`;
          options = [{display: `Confirm Delete`, color: '#DA2370', buttonColor: '#DA2370, #FB434A', action: 'delete_from_profile'}];
          break;
      }
      UNANIMATED_CONTAINER.next(true);

      const DR = this.matDialog.open(ConsentMenuComponent, {
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
            eventTarget.style.opacity = '1';
            switch (action) {
              case 'delete_from_profile':
                return zip(...this.selectedUsers.map((user) => this.userService.deleteUserRequest(user['id'], ''))).pipe(mapTo(true));
              default:
                return of(false);
            }
          }),
          tap(() => UNANIMATED_CONTAINER.next(false))
        )
        .subscribe(() => {
          this.selectedUsers = [];
        });
    }

    private getUserList(search = '') {
      this.userList = [];
      this.pending$.next(true);
      return this.userService.getAccountsRoles('', search)
        .pipe(
          filter(res => !!res.length));
    }

    private wrapToHtml(data, htmlTag, dataSet?) {
      const wrapper =  wrapToHtml.bind(this);
      return wrapper(data, htmlTag, dataSet || null);
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
                'Group(s)': partOf.length ? partOf : [`<span style="cursor: not-allowed; color: #999999;">No profile</span>`]
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

            const record = this.wrapToHtml(rawObj, 'span') as {[key: string]: SafeHtml; _data: any};
            if (+raw.id === +this.user.id) {
              record['Name'] = this.wrapToHtml(`${raw.display_name} <span style="
                position: absolute;
                margin-left: 10px;
                display: inline-block;
                width: 50px;
                height: 20px;
                background-color: rgba(0, 180, 118, .6);
                color: #ffffff;
                text-align: center;
                vertical-align: middle;
                line-height: 20px;
                border-radius: 4px;">Me</span>`, 'span');
            }
            Object.defineProperty(rawObj, 'id', { enumerable: false, value: raw.id });
            Object.defineProperty(rawObj, 'me', { enumerable: false, value: +raw.id === +this.user.id });
            Object.defineProperty(rawObj, '_originalUserProfile', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: raw
            });
            Object.defineProperty(rawObj, 'Sign-in status', { enumerable: false, value: raw.active ? 'Enabled' : 'Disabled'});
            Object.defineProperty(rawObj, 'Last sign-in', { enumerable: false, value: raw.last_login ? Util.formatDateTime(new Date(raw.last_login)) : 'Never signed in' })

            Object.defineProperty(record, '_data', { enumerable: false, value: rawObj });

          return record;
        });
    }

  showColumnSettings(evt: Event) {
    UNANIMATED_CONTAINER.next(true);
    const dialogRef = this.matDialog.open(ColumnsConfigDialogComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: {
              'trigger': evt.currentTarget,
              'form': this.dataTableHeaders,
              'role': '_all',
              'tableHeaders': this.dataTableHeaders
          }
      });
    dialogRef.afterClosed().subscribe(() => {
      UNANIMATED_CONTAINER.next(false);
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
