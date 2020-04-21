import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material';
import { HttpService } from '../../services/http-service';
import { UserService } from '../../services/user.service';
import {BehaviorSubject, Observable, of, Subject, zip} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, mapTo, mergeAll, switchAll, switchMap, take, takeUntil, tap} from 'rxjs/operators';
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
import {LocationsService} from '../../services/locations.service';
import {SyncSettingsComponent} from './sync-settings/sync-settings.component';
import {SyncProviderComponent} from './sync-provider/sync-provider.component';
import {GG4LSync} from '../../models/GG4LSync';
import {SchoolSyncInfo} from '../../models/SchoolSyncInfo';
declare const window;
import * as moment from 'moment';
import {TotalAccounts} from '../../models/TotalAccounts';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  animations: [bumpIn]
})
export class AccountsComponent implements OnInit, OnDestroy {

  splash: boolean;

  public accounts$: Observable<TotalAccounts> = this.adminService.countAccounts$;

  user: User;

  openTable: boolean;

  gg4lSettingsData: GG4LSync;
  schoolSyncInfoData: SchoolSyncInfo;
  isOpenModal: boolean;

  userList: User[] = [];
  lazyUserList: User[] = [];
  selectedUsers = [];

  destroy$ = new Subject();

  gSuiteOrgs: GSuiteOrgs = <GSuiteOrgs>{};

  querySubscriber$ = new Subject();
  showDisabledBanner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  loadingAccountsLimit: number = 50;

  dataTableHeaders;
  dataTableHeadersToDisplay: any[] = [];
  public dataTableEditState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public pending$: Subject<boolean> = new Subject<boolean>();


  public accountsButtons = [
      { title: 'Admins', param: '_profile_admin', banner: of(false),  leftIcon: './assets/Admin (Navy).svg', subIcon: './assets/Info (Blue-Gray).svg', role: 'admin_count' },
      { title: 'Teachers', param: '_profile_teacher', banner: of(false), leftIcon: './assets/Teacher (Navy).svg', subIcon: './assets/Info (Blue-Gray).svg', role: 'teacher_count' },
      { title: 'Assistants', param: '_profile_assistant', banner: of(false), leftIcon: './assets/Assistant (Navy).svg', subIcon: './assets/Info (Blue-Gray).svg', role: 'assistant_count' },
      { title: 'Students', param: '_profile_student', banner: this.showDisabledBanner$, leftIcon: './assets/Student (Navy).svg', subIcon: './assets/Info (Blue-Gray).svg', role: 'student_count' }
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
      switchAll(),
      filter((res: any[]) => !!res.length && !this.userList.length),
      takeUntil(this.destroy$)
    ).subscribe(users => {
        this.tableRenderer(users);
    });

   this.adminService.getGSuiteOrgs().pipe(takeUntil(this.destroy$)).subscribe(res => this.gSuiteOrgs = res);

    this.http.globalReload$.pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.querySubscriber$.next(this.getUserList());
      }),
      tap(() => {
        this.showDisabledBanner$.next(!this.http.getSchool().launch_date);
      }),
      switchMap(() => this.adminService.getCountAccountsRequest()),
      switchMap(() => this.gsProgress.onboardProgress$),
      switchMap((op) => {
        return zip(
          this.adminService.getGG4LSyncInfoRequest().pipe(filter(res => !!res)),
          this.adminService.getSpSyncingRequest().pipe(filter(res => !!res)))
          .pipe(
            map(([gg4l, sync]: [GG4LSync, SchoolSyncInfo]) => {
              this.splash = op.setup_accounts && (!op.setup_accounts.start.value || !op.setup_accounts.end.value);
              // this.splash = false;
              this.gg4lSettingsData = gg4l;
              this.schoolSyncInfoData = sync;
              if (!!gg4l.last_successful_sync && !sync.login_provider && !this.splash) {
                this.openSyncProvider();
              }
              return gg4l;
            }));
      })
    )
    .subscribe((op: any) => {
      // debugger;
      // return zip(
      //   this.adminService.getGG4LSyncInfoRequest().pipe(filter(res => !!res)),
      //   this.adminService.getSpSyncingRequest().pipe(filter(res => !!res)))
      //   .pipe(
      //     map(([gg4l, sync]: [GG4LSync, SchoolSyncInfo]) => {
      //       this.splash = op.setup_accounts && (!op.setup_accounts.start.value || !op.setup_accounts.end.value);
      //       // this.splash = false;
      //       this.gg4lSettingsData = gg4l;
      //       this.schoolSyncInfoData = sync;
      //       if (!!gg4l.last_successful_sync && !sync.login_provider && !this.splash) {
      //         this.openSyncProvider();
      //       }
      //       return gg4l;
      //     }));
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

    TABLE_RELOADING_TRIGGER.pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.userService.accounts.allAccounts)
    ).subscribe((users) => {
      this.tableRenderer(users);
    });


    this.userService.lastAddedAccounts$._all.pipe(
      takeUntil(this.destroy$),
      filter((res: any) => !!res && res.length)
    )
      .subscribe(res => {
          this.dataTableHeadersToDisplay = [];
          this.lazyUserList = this.buildUserListData(res);
    });

  }

  tableRenderer(userList: User[]) {
    this.dataTableHeadersToDisplay = [];
    this.userList = this.buildUserListData(userList);
    this.pending$.next(false);
  }

  tableTrigger() {
    this.openTable = !this.openTable;
    if (!this.openTable) {
      this.lazyUserList = [];
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addUser() {
    const DR = this.matDialog.open(AddUserDialogComponent, {
      width: '425px', height: '500px',
      panelClass: 'accounts-profiles-dialog',
      backdropClass: 'custom-bd',
      data: {
        role: '_all',
        syncInfo: this.schoolSyncInfoData
      }
    });
  }

  openSyncSettings() {
    const SS = this.matDialog.open(SyncSettingsComponent, {
      panelClass: 'accounts-profiles-dialog',
      backdropClass: 'custom-bd',
      data: {gg4lInfo: this.gg4lSettingsData}
    });
  }

  openSyncProvider() {
    if (!this.isOpenModal) {
      this.isOpenModal = true;
      const SP = this.matDialog.open(SyncProviderComponent, {
        width: '425px',
        height: '425px',
        panelClass: 'accounts-profiles-dialog',
        disableClose: true,
        backdropClass: 'custom-bd',
        data: {gg4lInfo: this.gg4lSettingsData}
      });

      SP.afterClosed().subscribe(res => {
        this.isOpenModal = false;
      });
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
            controlLabel: 'Dashboard tab Access',
          },
          'access_hall_monitor': {
            controlName: 'access_hall_monitor',
            controlLabel: 'Hall Monitor tab Access',
          },
          'access_admin_search': {
            controlName: 'access_admin_search',
            controlLabel: 'Search tab Access',
          },
          'access_pass_config': {
            controlName: 'access_pass_config',
            controlLabel: 'Rooms tab Access',
          },
          'access_user_config': {
            controlName: 'access_user_config',
            controlLabel: 'Accounts tab Access',
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
      .pipe(
        filter(userListReloadTrigger => !!userListReloadTrigger)
      )
      .subscribe(() => {
        this.selectedUsers = [];
        this.querySubscriber$.next(this.userService.accounts.allAccounts);
      });
  }

    setSelected(e) {
      this.selectedUsers = e;
    }

    findRelevantAccounts(search) {
      of(search)
        .pipe(
          distinctUntilChanged(),
          debounceTime(200),
          switchMap(value => {
            if (value) {
              return this.userService.getUsersList('', value);
            } else {
              return this.userService.getAccountsRole('_all');
            }
          })
        )
        .subscribe(userList => {
          this.dataTableHeadersToDisplay = [];
          this.userList = this.buildUserListData(userList);
          this.pending$.next(false);
        });
    }

    promptConfirmation(eventTarget: HTMLElement, option: string = '') {

    console.log(this.selectedUsers);
    debugger;

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
      return this.userService.getAccountsRoles('', search, 50)
        .pipe(
          filter(res => !!res.length), take(2));
    }

  loadMore() {
      this.userService.getMoreUserListRequest('_all');
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

  openNewTab(url) {
    window.open(url);
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
            panelClass: 'admin-form-dialog-container-white',
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
      panelClass: 'admin-form-dialog-container-white',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '500px',
      data: data
    });

  }
}
