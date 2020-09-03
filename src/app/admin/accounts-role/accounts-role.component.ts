import {ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material';
import {BehaviorSubject, interval, merge, Observable, of, Subject, zip} from 'rxjs';
import {UserService} from '../../services/user.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged, exhaust,
  filter,
  map,
  mergeAll, skip, switchAll,
  switchMap, take,
  takeUntil,
  tap
} from 'rxjs/operators';
import {Util} from '../../../Util';
import {HttpService} from '../../services/http-service';
import {ConsentMenuComponent} from '../../consent-menu/consent-menu.component';
import {AdminService} from '../../services/admin.service';
import {ColumnsConfigDialogComponent} from '../columns-config-dialog/columns-config-dialog.component';
import {StorageService} from '../../services/storage.service';
import {ProfileCardDialogComponent} from '../profile-card-dialog/profile-card-dialog.component';
import {AddUserDialogComponent} from '../add-user-dialog/add-user-dialog.component';
import {User} from '../../models/User';
import {Location} from '../../models/Location';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {RepresentedUser} from '../../navbar/navbar.component';
import {LocationsService} from '../../services/locations.service';
import {GSuiteOrgs} from '../../models/GSuiteOrgs';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {wrapToHtml} from '../helpers';
import {UNANIMATED_CONTAINER} from '../../consent-menu-overlay';
import {GSuiteSelector, OrgUnit} from '../../sp-search/sp-search.component';
import { uniqBy } from 'lodash';
import {GettingStartedProgressService} from '../getting-started-progress.service';
import {TotalAccounts} from '../../models/TotalAccounts';
import {observableToBeFn} from 'rxjs/internal/testing/TestScheduler';
import {School} from '../../models/School';
import {StatusPopupComponent} from '../profile-card-dialog/status-popup/status-popup.component';
import {TableService} from '../sp-data-table/table.service';

export const TABLE_RELOADING_TRIGGER =  new Subject<any>();


@Component({
  selector: 'app-accounts-role',
  templateUrl: './accounts-role.component.html',
  styleUrls: ['./accounts-role.component.scss']
})
export class AccountsRoleComponent implements OnInit, OnDestroy {

  private destroy$: Subject<any> = new Subject();
  private searchChangeObserver$: Subject<string> = new Subject<string>();

  public role: string;
  public dataTableHeadersToDisplay: string[] = [];
  public userList: any[] = [];
  public selectedUsers: any[] = [];
  public placeholder: boolean;
  public loaded: boolean = false;
  public dataTableHeaders: any;
  public profilePermissions: any;
  public initialSearchString: string;
  public tabVisibility: boolean = false;
  public isLoadUsers: boolean = true;
  public user: User;
  private limitCounter: number = 20;
  public dataTableEditState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public pending$: Subject<boolean> = new Subject<boolean>();
  public lazyUserList: User[] = [];

  public syncingDots: string;

  public accounts$: Observable<TotalAccounts> = this.adminService.countAccounts$;

  public GSuiteOrgs: GSuiteOrgs = <GSuiteOrgs>{};
  public searchValue: string;

  querySubscriber$ = new Subject();

  accountRoleData$: Observable<any[]>;
  selectedAccounts: User[];

  isLoading$: Observable<boolean>;
  isLoaded$: Observable<boolean>;

  schools$: Observable<School[]>;

  tableHeaders;
  showDisabledChip: boolean;


  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private http: HttpService,
    private adminService: AdminService,
    private matDialog: MatDialog,
    private _zone: NgZone,
    public darkTheme: DarkThemeSwitch,
    private tableService: TableService
  ) {

  }

  // get noUsersDummyVisibility() {
  //   return this.userService.countAccounts$[this.role];
  // }
  //
  // get bulkSignInStatus() {
  //   return this.selectedUsers.every(profile => profile._originalUserProfile.active);
  // }
  //
  // formatDate(date) {
  //   return Util.formatDateTime(new Date(date));
  // }

  ngOnInit() {
    this.schools$ = this.http.schoolsCollection$;
    this.profilePermissions =
      this.role === '_profile_admin'
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
            controlLabel: 'Explore tab Access',
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
        this.role === '_profile_teacher'
          ?
          {
            'access_hall_monitor': {
              controlName: 'access_hall_monitor',
              controlLabel: 'Access to Hall Monitor'
            },
          }
          :
          this.role === '_profile_assistant'
            ?
            {
              'access_passes': {
                controlName: 'access_passes',
                controlLabel: 'Passes tab Access'
              },
              'access_hall_monitor': {
                controlName: 'access_hall_monitor',
                controlLabel: 'Hall Monitor tab Access'
              },
              'access_teacher_room': {
                controlName: 'access_teacher_room',
                controlLabel: 'My Room tab Access'
              },
            }
            :
            {};

    this.accountRoleData$ = this.http.globalReload$
      .pipe(
        switchMap(() => this.route.params),
        tap(params => {
          this.role = params.role;
          this.isLoaded$ = this.userService.getLoadingAccounts(this.role).loaded;
          this.isLoading$ = this.userService.getLoadingAccounts(this.role).loading;
        }),
        switchMap(() => {
          return this.userService.getAccountsRoles(this.role, '', 50);
        }),
        map((accounts: User[]) => {
          if (!accounts.length) {
           return this.emptyRoleObject();
          }
          return accounts.map(account => {
            const rowObj = this.buildDataForRole(account);

            Object.defineProperty(rowObj, 'id', { enumerable: false, value: account.id});
            Object.defineProperty(rowObj, 'me', { enumerable: false, value: +account.id === +this.user.id });
            Object.defineProperty(rowObj, 'last_sign_in', {enumerable: false, value: account.last_login });
            Object.defineProperty(rowObj, '_originalUserProfile', {
              enumerable: false,
              configurable: false,
              writable: false,
              value: account
            });
            Object.defineProperty(rowObj, '_data', { enumerable: false, value: rowObj });

            return rowObj;
          });
        })
      );

    this.userService.userData
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user;
    });

    this.adminService.searchAccountEmit$.asObservable()
      .pipe(
        takeUntil(this.destroy$),
        tap((value) => this.userService.getAccountsRoles(this.role, value, 1000))
      )
      .subscribe(value => {
      this.searchValue = value;
    });

  }

  emptyRoleObject() {
    if (this.role === '_profile_admin' || this.role === '_profile_student') {
      return [{
        'Name': null,
        'Email/username': null,
        'Status': null,
        'Last sign-in': null,
        'Type': null,
        'Permissions': null
      }];
    } else if (this.role === '_profile_teacher') {
      return [{
        'Name': null,
        'Email/username': null,
        'Rooms': null,
        'Status': null,
        'Last sign-in': null,
        'Type': null,
        'Permissions': null
      }];
    } else if (this.role === '_profile_assistant') {
      return [{
        'Name': null,
        'Email/username': null,
        'Acting on Behalf Of': null,
        'Status': null,
        'Last sign-in': null,
        'Type': null,
        'Permissions': null
      }];
    }
  }

  buildDataForRole(account) {
    const permissionsRef = this.profilePermissions;
    const permissions = (function() {
      const tabs = Object.values(permissionsRef).map((tab: any) => {
        tab.allowed = account.roles.includes(tab.controlName);
        return tab;
      });
      if (tabs.every((item: any): boolean => item.allowed)) {
        return 'No restrictions';
      } else {
        const restrictedTabs = tabs.filter((item: any): boolean => !item.allowed);
        if (restrictedTabs.length > 1) {
          return `${restrictedTabs.length} tabs restricted`;
        } else {
          return `${restrictedTabs[0].controlLabel} restricted`;
        }
      }
    }());
    const roleObject = {
      'Name': account.display_name,
      'Email/username': account.primary_email,
    };
    let objectToTable;
    if (this.role === '_profile_admin' || this.role === '_profile_student') {
      objectToTable = {...roleObject, ...{
          'Status': account.status,
          'Last sign-in': account.last_login ? Util.formatDateTime(new Date(account.last_login)) : 'Never signed in',
          'Type': account.demo_account ? 'Demo' : account.sync_types[0] === 'google' ? 'G Suite' : account.sync_types[0] === 'gg4l' ? 'GG4L' : 'Basic',
          'Permissions': permissions
      }};
    } else if (this.role === '_profile_teacher') {
      objectToTable = {...roleObject, ...{
          'Rooms': account.assignedTo.length ? uniqBy(account.assignedTo, 'id').map((room: any) => room.title).join(', ') : 'No rooms assigned',
          'Status': account.status,
          'Last sign-in': account.last_login ? Util.formatDateTime(new Date(account.last_login)) : 'Never signed in',
          'Type': account.demo_account ? 'Demo' : account.sync_types[0] === 'google' ? 'G Suite' : account.sync_types[0] === 'gg4l' ? 'GG4L' : 'Basic',
          'Permissions': permissions
      }};
    } else if (this.role === '_profile_assistant') {
      objectToTable = {...roleObject, ...{
          'Acting on Behalf Of': account.canActingOnBehalfOf.length ? account.canActingOnBehalfOf.map((u: RepresentedUser) => {
            return `${u.user.display_name} (${u.user.primary_email.slice(0, u.user.primary_email.indexOf('@'))})`;
          }).join(', ') : 'No Teachers',
          'Status': account.status,
          'Last sign-in': account.last_login ? Util.formatDateTime(new Date(account.last_login)) : 'Never signed in',
          'Type': account.demo_account ? 'Demo' : account.sync_types[0] === 'google' ? 'G Suite' : account.sync_types[0] === 'gg4l' ? 'GG4L' : 'Basic',
          'Permissions': permissions
      }};
    }

    return objectToTable;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  findProfileByRole(evt) {
    this.tabVisibility = false;

    setTimeout(() => {
      if (evt instanceof Location) {
        this.router.navigate(['admin/passconfig'], {
          queryParams: {
            locationId: evt.id,
          }
        });
      } else {
        this.router.navigate(['admin/accounts', evt.role], {queryParams: {profileName: evt.row['Name']}});
      }
    }, 250);
  }

  showProfileCard(evt) {
    // if (this.role === '_profile_admin') {
    //   this.profilePermissions['access_user_config'].disabled = evt.id === +this.user.id;
    // }
    const profileTitle =
      this.role === '_profile_admin' ? 'administrator' :
        this.role === '_profile_teacher' ? 'teacher' :
          this.role === '_profile_student' ? 'student' :
          this.role === '_profile_assistant' ? 'student' : 'assistant';
    const data = {
      profile: evt,
      profileTitle: profileTitle,
      bulkPermissions: null,
      role: this.role,
      permissions: this.profilePermissions,
    };

    const dialogRef = this.matDialog.open(ProfileCardDialogComponent, {
      panelClass: 'overlay-dialog',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '500px',
      data: data
    });

    dialogRef.afterClosed()
      .subscribe((userListReloadTrigger) => {
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
    });
  }

  // private getUserList(query: string = '') {
  //   this.loaded = false;
  //   this.placeholder = false;
  //   this.userList = [];
  //   return this.userService
  //     .getAccountsRoles(this.role, query, 50)
  //     .pipe(
  //       tap((res) => {
  //         this.dataTableHeadersToDisplay = [];
  //       })
  //     );
  // }
  //
  // syncNow() {
  //     this.adminService.syncNow().subscribe();
  //     this.adminService.getGSuiteOrgs().subscribe(res => this.GSuiteOrgs = res);
  // }

  // private wrapToHtml(data, htmlTag, dataIndex?) {
  //   const wrapper =  wrapToHtml.bind(this);
  //   return wrapper(data, htmlTag, dataIndex);
  // }
  //
  // private buildUserListData(userList) {
  //   this.isLoadUsers = this.limitCounter === userList.length;
  //   return userList.map((raw, index) => {
  //     const permissionsRef: any = this.profilePermissions;
  //       const partOf = [];
  //       if (raw.roles.includes('_profile_student')) partOf.push({title: 'Student', role: '_profile_student'});
  //       if (raw.roles.includes('_profile_teacher')) partOf.push({title: 'Teacher', role: '_profile_teacher'});
  //       if (raw.roles.includes('_profile_assistant')) partOf.push({title: 'Assistant', role: '_profile_assistant'});
  //       if (raw.roles.includes('_profile_admin')) partOf.push({title: 'Administrator', role: '_profile_admin'});
  //
  //       // const disabledSignIn = raw.roles.includes('_profile_student') && this.showDisabledChip;
  //
  //       const rawObj = {
  //         'Name': raw.display_name,
  //         'Email/Username': (/@spnx.local/).test(raw.primary_email) ? raw.primary_email.slice(0, raw.primary_email.indexOf('@spnx.local')) : raw.primary_email,
  //         'rooms': raw.assignedTo && raw.assignedTo.length ? uniqBy(raw.assignedTo, 'id').map((room: any) => room.title) : [`<span style="cursor: not-allowed; color: #999999; text-decoration: none;">No rooms assigned</span>`],
  //         'Account Type': raw.sync_types[0] === 'google' ? 'G Suite' : raw.sync_types[0] === 'gg4l' ? 'GG4L' : 'Standard',
  //         'Acting on Behalf Of': raw.canActingOnBehalfOf ? raw.canActingOnBehalfOf.map((u: RepresentedUser) => {
  //           return `${u.user.display_name} (${u.user.primary_email.slice(0, u.user.primary_email.indexOf('@'))})`;
  //         }).join(', ') : '',
  //         'Sign-in status': raw.active ? 'Enabled' : 'Disabled',
  //         'Last sign-in': raw.last_login ? Util.formatDateTime(new Date(raw.last_login)) : 'Never signed in',
  //         'Group(s)': partOf.length ? partOf : [{title: 'No profile'}],
  //         'Permissions': (function() {
  //           const tabs = Object.values(permissionsRef).map((tab: any) => {
  //             tab.allowed = raw.roles.includes(tab.controlName);
  //             return tab;
  //           });
  //           if (tabs.every((item: any): boolean => item.allowed)) {
  //             return 'No restrictions';
  //           } else {
  //             const restrictedTabs = tabs.filter((item: any): boolean => !item.allowed);
  //             if (restrictedTabs.length > 1) {
  //               return `${restrictedTabs.length} tabs restricted`;
  //             } else {
  //               return `${restrictedTabs[0].controlLabel} restricted`;
  //             }
  //           }
  //         }())
  //       };
  //
  //       for (const key in rawObj) {
  //         if (!this.dataTableHeaders[key]) {
  //           delete rawObj[key];
  //         }
  //         if (index === 0) {
  //           if (this.dataTableHeaders[key] && this.dataTableHeaders[key].value) {
  //             this.dataTableHeadersToDisplay.push(key);
  //           }
  //         }
  //       }
  //
  //       const record = this.wrapToHtml(rawObj, 'span') as {[key: string]: SafeHtml; _data: any};
  //
  //       if (+raw.id === +this.user.id) {
  //         record['Name'] = this.wrapToHtml(`
  //         ${raw.display_name} <span style="
  //         position: absolute;
  //         margin-left: 10px;
  //         display: inline-block;
  //         width: 50px;
  //         height: 20px;
  //         background-color: rgba(0, 180, 118, .6);
  //         color: #ffffff;
  //         text-align: center;
  //         vertical-align: middle;
  //         line-height: 20px;
  //         border-radius: 4px;">Me</span>`, 'span');
  //       }
  //
  //       Object.defineProperty(rawObj, 'id', { enumerable: false, value: raw.id });
  //       Object.defineProperty(rawObj, 'me', { enumerable: false, value: +raw.id === +this.user.id });
  //       Object.defineProperty(rawObj, 'last_sign_in', {enumerable: false, value: raw.last_login });
  //       Object.defineProperty(rawObj, '_originalUserProfile', {
  //         enumerable: false,
  //         configurable: false,
  //         writable: false,
  //         value: raw
  //       });
  //       Object.defineProperty(record, '_data', { enumerable: false, value: rawObj });
  //
  //       this.loaded = true;
  //
  //     return record;
  //   });
  //
  // }

  loadMore() {
    this.userService.getMoreUserListRequest(this.role);
  }

  // syncOrgUnits(evt: OrgUnit[]) {
  //
  //   const syncBody = {};
  //         syncBody['is_enabled'] = true;
  //
  //   evt.forEach((item: OrgUnit) => {
  //     syncBody[`selector_${item.unitId}s`] = item.selector.map((s: GSuiteSelector) => s.as);
  //   });
  //   // console.log(syncBody);
  //
  //   this.adminService.updateSpSyncing(syncBody)
  //     .pipe(
  //       switchMap(() => {
  //         return this.gsProgress.updateProgress('setup_accounts:end');
  //       })
  //     )
  //     .subscribe((res) => {
  //       // console.log(res);
  //     });
  //
  //
  // }
}
