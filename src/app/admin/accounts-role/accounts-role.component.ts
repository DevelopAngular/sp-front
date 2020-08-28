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

    ////// G_Suite

  // public syncing = {
  //   intervalId: null,
  //   enabled: false,
  //   syncingDots: '',
  //   // destroyer$: new Subject<any>(),
  //   start() {
  //     if (this.enabled) {
  //       return;
  //     }
  //     this.enabled = true;
  //     let dot = 0;
  //     this.intervalId = interval(250)
  //       .pipe(
  //         map(() => {
  //           dot += 1;
  //           if (dot > 3) {
  //             dot = 0;
  //           }
  //           return dot;
  //         }),
  //       )
  //       .subscribe((res) => {
  //         // console.log(res);
  //         switch (res) {
  //           case 0:
  //             this.syncingDots = '';
  //             break;
  //           case 1:
  //             this.syncingDots = '.';
  //             break;
  //           case 2:
  //             this.syncingDots = '..';
  //             break;
  //           case 3:
  //             this.syncingDots = '...';
  //             break;
  //         }
  //       });
  //   },
  //   end() {
  //     if (!this.enabled) {
  //       return;
  //     }
  //     this.enabled = false;
  //     this.syncingDots = '';
  //     this.intervalId.unsubscribe();
  //   }
  // };

  public GSuiteOrgs: GSuiteOrgs = <GSuiteOrgs>{};
  public searchValue: string;

  querySubscriber$ = new Subject();

  schoolSyncInfoData;

  accountRoleData$: Observable<any[]>;

  isLoading$: Observable<boolean>;
  isLoaded$: Observable<boolean>;

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
    private storage: StorageService,
    public darkTheme: DarkThemeSwitch,
    private locService: LocationsService,
    private domSanitizer: DomSanitizer,
    private gsProgress: GettingStartedProgressService,
    private cdr: ChangeDetectorRef
  ) {

  }

  get noUsersDummyVisibility() {
    return this.userService.countAccounts$[this.role];
  }

  get bulkSignInStatus() {
    return this.selectedUsers.every(profile => profile._originalUserProfile.active);
  }

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  ngOnInit() {
    // this.querySubscriber$.pipe(
    //   // take(1),
    //   switchAll(),
    //   filter((res: any) => res.length),
    //   takeUntil(this.destroy$))
    //   .subscribe((userList: any) => {
    //       this.tableRenderer(userList);
    //   });

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
        map((accounts: any[]) => {
          if (!accounts.length) {
           return [{
              'Name': null,
              'Email/username': null,
              'Status': null,
              'Last sign-in': 'Never signed in',
              'Type': 'Basic'
           }];
          }
          return accounts.map(account => {
            return {
              'Name': account.display_name,
              'Email/username': account.primary_email,
              'Status': account.status,
              'Last sign-in': account.last_login ? Util.formatDateTime(new Date(account.last_login)) : 'Never signed in',
              'Type': 'Basic'
            };
          });
        })
      );

    // this.adminService.schoolSyncInfo$
    //   .pipe(
    //     takeUntil(this.destroy$)
    //   ).subscribe(res => {
    //   this.schoolSyncInfoData = res;
    // });

    // interval(1758)
    //   .pipe(
    //     filter(() => this.role === 'g_suite'),
    //     switchMap((res) => {
    //       return this.adminService.getGSuiteOrgs();
    //     }),
    //     takeUntil(this.destroy$)
    //   )
    //   .subscribe((res: any) => {
    //     if (res.is_syncing) {
    //       this.syncing.start();
    //     } else if (!res.is_syncing) {
    //       this.syncing.end();
    //     }
    //     for (const key in res) {
    //       if (this.GSuiteOrgs[key] !== res[key]) {
    //         this.GSuiteOrgs[key] = res[key];
    //       }
    //     }
    //   });


    // merge(this.http.globalReload$, this.router.events.pipe(filter(event => event instanceof NavigationEnd))).pipe(
    //   tap(() => {
    //     this.role = null;
    //     this.selectedUsers = [];
    //     this.userList = [];
    //     this.lazyUserList = [];
    //     this.placeholder = false;
    //   }),
    //   switchMap(() => {
    //     return this.route.params.pipe(takeUntil(this.destroy$));
    //   }),
    //   map((params) => {
    //     this.role = params.role;
    //     if (this.role !== 'g_suite') {
    //       this.isLoaded$ = this.userService.getLoadingAccounts(this.role).loaded;
    //       this.isLoading$ = this.userService.getLoadingAccounts(this.role).loading;
    //     }
    //     return params;
    //   }),
    //   filter(() => this.role !== 'g_suite'),
    //   takeUntil(this.destroy$)
    // )
    // .subscribe((qp) => {
    //   const {profileName} = qp;
    //   this.initialSearchString = this.initialSearchString ? this.initialSearchString : profileName;
    //   this.tabVisibility = true;
    //   this.buildTableHeaders();
    //     const headers = this.storage.getItem(`${this.role}_columns`);
    //     if ( headers ) {
    //       this.dataTableHeaders = JSON.parse(headers);
    //
    //       if (!this.dataTableHeaders['Account Type']) {
    //         this.dataTableHeaders['Account Type'] = {
    //           value: true,
    //           label: 'Account Type',
    //           disabled: false
    //         };
    //       }
    //     } else {
    //       this.dataTableHeaders = {
    //         'Name': {
    //           value: true,
    //           label: 'Name',
    //           disabled: true
    //         },
    //         'Email/Username': {
    //           value: true,
    //           label: 'Email/Username',
    //           disabled: true
    //         },
    //         'Account Type': {
    //           value: true,
    //           label: 'Account Type',
    //           disabled: false
    //         },
    //         'Sign-in status': {
    //           value: true,
    //           label: 'Sign-in status',
    //           disabled: false
    //         },
    //         'Last sign-in': {
    //           value: true,
    //           label: 'Last sign-in',
    //           disabled: false
    //         }
    //       };
    //
    //       switch (this.role) {
    //         case '_profile_teacher':
    //           this.dataTableHeaders['rooms'] = {
    //             value: true,
    //             label: 'rooms',
    //             disabled: false
    //           };
    //           this.dataTableHeaders['Permissions'] = {
    //             value: false,
    //             label: 'Permissions',
    //             disabled: false
    //           };
    //           break;
    //         case '_profile_assistant':
    //           this.dataTableHeaders['Acting on Behalf Of'] = {
    //             value: true,
    //             label: 'Acting on Behalf Of',
    //             disabled: false
    //           };
    //           this.dataTableHeaders['Permissions'] = {
    //             value: false,
    //             label: 'Permissions',
    //             disabled: false
    //           };
    //           break;
    //         case '_profile_admin':
    //           this.dataTableHeaders['Permissions'] = {
    //             value: false,
    //             label: 'Permissions',
    //             disabled: false
    //           };
    //           break;
    //       }
    //     }
    //
    //   this.profilePermissions =
    //     this.role === '_profile_admin'
    //                ?
    //     {
    //       'access_admin_dashboard': {
    //         controlName: 'access_admin_dashboard',
    //         controlLabel: 'Dashboard tab Access',
    //       },
    //       'access_hall_monitor': {
    //         controlName: 'access_hall_monitor',
    //         controlLabel: 'Hall Monitor tab Access',
    //       },
    //       'access_admin_search': {
    //         controlName: 'access_admin_search',
    //         controlLabel: 'Search tab Access',
    //       },
    //       'access_pass_config': {
    //         controlName: 'access_pass_config',
    //         controlLabel: 'Rooms tab Access',
    //       },
    //       'access_user_config': {
    //         controlName: 'access_user_config',
    //         controlLabel: 'Accounts tab Access',
    //       },
    //     }
    //                :
    //     this.role === '_profile_teacher'
    //                ?
    //     {
    //       'access_hall_monitor': {
    //         controlName: 'access_hall_monitor',
    //         controlLabel: 'Access to Hall Monitor'
    //       },
    //     }
    //                :
    //     this.role === '_profile_assistant'
    //                ?
    //     {
    //       'access_passes': {
    //         controlName: 'access_passes',
    //         controlLabel: 'Passes tab Access'
    //       },
    //       'access_hall_monitor': {
    //         controlName: 'access_hall_monitor',
    //         controlLabel: 'Hall Monitor tab Access'
    //       },
    //       'access_teacher_room': {
    //         controlName: 'access_teacher_room',
    //         controlLabel: 'My Room tab Access'
    //       },
    //     }
    //                :
    //     {};
    //   this.querySubscriber$.next(this.getUserList(this.initialSearchString));
    // });

    // TABLE_RELOADING_TRIGGER.pipe(
    //   switchMap(() => this.userService.getAccountsRole(this.role))
    // ).subscribe((userList) => {
    //   this.tableRenderer(userList);
    // });

    this.userService.userData.subscribe((user) => {
      this.user = user;
    });

    this.route.params.pipe(
      switchMap(params => {
        return this.userService.lastAddedAccounts$[params.role];
      }),
      filter((res: any) => !!res && res.length)
    ).subscribe(res => {
        this.dataTableHeadersToDisplay = [];
        this.lazyUserList = this.buildUserListData(res);
    });

    this.adminService.searchAccountEmit$.asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
      this.searchValue = value;
      this.findRelevantAccounts(value);
    });

  }

  tableRenderer(userList: User[]) {
    this.dataTableHeadersToDisplay = [];
    this.userList = this.buildUserListData(userList);
    this.pending$.next(false);
    this.cdr.detectChanges();
    this.placeholder = !!userList.length;
  }

  buildTableHeaders() {
    this.tableHeaders = {
      'Name': {
        index: 0,
        label: 'Name',
      },
      'Email/Username': {
        index: 1,
        label: 'Email/Username',
      },
      'Account Type': {
        index: 2,
        label: 'Account Type',
      },
      'Sign-in status': {
        label: 'Sign-in status',
      },
      'Last sign-in': {
        label: 'Last sign-in',
      }
    };
    if (this.role === '_profile_admin') {
      this.tableHeaders['Sign-in status'].index = 3;
      this.tableHeaders['Last sign-in'].index = 4;
      this.tableHeaders['Permissions'] = {
        index: 5,
        label: 'Permissions',
      };

    } else if (this.role === '_profile_teacher') {
      this.tableHeaders['Sign-in status'].index = 4;
      this.tableHeaders['Last sign-in'].index = 5;
      this.tableHeaders['Account Type'].index = 3;
      this.tableHeaders['rooms'] = {
        index: 2,
        label: 'rooms',
      };
      this.tableHeaders['Permissions'] = {
        index: 6,
        label: 'Permissions',
      };
    } else if (this.role === '_profile_assistant') {
      this.tableHeaders['Sign-in status'].index = 4;
      this.tableHeaders['Last sign-in'].index = 5;
      this.tableHeaders['Acting on Behalf Of'] = {
        index: 3,
        label: 'Acting on Behalf Of',
      };
      this.tableHeaders['Permissions'] = {
        index: 6,
        label: 'Permissions',
      };
    } else if (this.role === '_profile_student') {
      this.tableHeaders['Sign-in status'].index = 3;
      this.tableHeaders['Last sign-in'].index = 4;
    }
  }

  findRelevantAccounts(searchValue) {
    of(searchValue)
      .pipe(
        distinctUntilChanged(),
        debounceTime(200),
        switchMap(value => {
          if (value) {
            return this.userService.getUsersList(this.role, value);
          } else {
            return this.userService.getAccountsRole(this.role);
          }
        })
      )
      .subscribe(userList => {
        this.dataTableHeadersToDisplay = [];
        this.userList = this.buildUserListData(userList);
        this.pending$.next(false);
        this.placeholder = !!userList.length;
      });
  }


  setSelected(e) {
    this.selectedUsers = e;
  }

  exportAccountData() {
    this.userService.exportUserData(this.selectedUsers[0].id)
      .subscribe(res => console.log(res));
  }

  // promptConfirmation(eventTarget: HTMLElement, option: string = '') {
  //
  //   if (!eventTarget.classList.contains('button')) {
  //     (eventTarget as any) = eventTarget.closest('.button');
  //   }
  //
  //   eventTarget.style.opacity = '0.75';
  //   let header: string;
  //   let options: any[];
  //   const profile: string =
  //     this.role === '_profile_admin' ? 'administrator' :
  //     this.role === '_profile_teacher' ? 'teacher' :
  //     this.role === '_profile_student' ? 'student' :
  //     this.role === '_profile_assistant' ? 'assistant' : 'unknown';
  //
  //   switch (option) {
  //     case 'delete_from_profile':
  //       if (this.role === '_all') {
  //         header = `Are you sure you want to permanently delete ${this.selectedUsers.length > 1 ? 'these accounts' : 'this account'} and all associated data? This cannot be undone.`;
  //       } else {
  //         header = `Removing ${this.selectedUsers.length > 1 ? 'these users' : 'this user'} from the ${profile} group will remove them from this group, but it will not delete all data associated with the account.`;
  //       }
  //       options = [{display: `Confirm  ${this.role === '_all' ? 'Delete' : 'Remove'}`, color: '#DA2370', buttonColor: '#DA2370, #FB434A', action: 'delete_from_profile'}];
  //       break;
  //     case 'disable_sign_in':
  //       header = `Disable sign-in to prevent ${this.selectedUsers.length > 1 ? 'these users' : 'this user'} from being able to sign in with the ${profile} group.`;
  //       options = [{display: 'Disable sign-in', color: '#001115', buttonColor: '#001115, #033294', action: 'disable_sign_in'}];
  //       break;
  //     case 'enable_sign_in':
  //       header = `Enable sign-in to allow ${this.selectedUsers.length > 1 ? 'these users' : 'this user'} to be able to sign in with the ${profile} group.`;
  //       options = [{display: 'Enable sign-in', color: '#00B476', buttonColor: '#03CF31, #00B476', action: 'enable_sign_in'}];
  //       break;
  //   }
  //   UNANIMATED_CONTAINER.next(true);
  //     const DR = this.matDialog.open(ConsentMenuComponent,
  //       {
  //         data: {
  //           role: this.role,
  //           selectedUsers: this.selectedUsers,
  //           restrictions: this.profilePermissions,
  //           header: header,
  //           options: options,
  //           trigger: new ElementRef(eventTarget)
  //         },
  //         panelClass: 'consent-dialog-container',
  //         backdropClass: 'invis-backdrop',
  //       });
  //     DR.afterClosed()
  //       .pipe(
  //         switchMap((action): Observable<any> => {
  //           eventTarget.style.opacity = '1';
  //
  //           switch (action) {
  //             case 'delete_from_profile':
  //              return zip(...this.selectedUsers.map((user) => this.userService.deleteUserRequest(user['id'], this.role)));
  //             case 'disable_sign_in':
  //               return zip(...this.selectedUsers.map((user) => this.userService.setUserActivityRequest(user._originalUserProfile, false, this.role)));
  //             case 'enable_sign_in':
  //               return zip(...this.selectedUsers.map((user) => this.userService.setUserActivityRequest(user._originalUserProfile, true, this.role)));
  //
  //             default:
  //               return of(false);
  //           }
  //         }),
  //         tap(() => UNANIMATED_CONTAINER.next(false))
  //       )
  //       .subscribe(() => {
  //         this.selectedUsers = [];
  //         this.querySubscriber$.next(this.userService.getAccountsRole(this.role));
  //       });
  //
  // }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showColumnSettings(evt: Event) {
    UNANIMATED_CONTAINER.next(true);
    const dialogRef = this.matDialog.open(ColumnsConfigDialogComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': evt.currentTarget,
        'form': this.dataTableHeaders,
        'role': this.role,
        'tableHeaders': this.tableHeaders
       }
    });
    dialogRef.afterClosed().subscribe(() => {
      UNANIMATED_CONTAINER.next(false);
    });
  }

  // addUser() {
  //   const DR = this.matDialog.open(AddUserDialogComponent,
  //     {
  //       width: '425px', height: '500px',
  //       panelClass: 'accounts-profiles-dialog',
  //       backdropClass: 'custom-bd',
  //       data: {
  //         role: this.role,
  //         selectedUsers: this.selectedUsers,
  //         permissions: this.profilePermissions,
  //         syncInfo: this.schoolSyncInfoData
  //       }
  //     });
  //   DR.afterClosed().pipe(
  //     switchMap(() => this.userService.nextRequests$[this.role]),
  //     take(1),
  //     filter(next => !next),
  //     switchMap((next) => {
  //       return this.userService.getAccountsRole(this.role);
  //     }),
  //     take(2)
  //   )
  //     .subscribe((userList) => {
  //       this.selectedUsers = [];
  //       this.tableRenderer(userList);
  //   });
  // }

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

  showProfileCard(evt, bulk: boolean = false, gSuite: boolean = false) {
    if (this.role === '_profile_admin') {
      this.profilePermissions['access_user_config'].disabled = evt.id === +this.user.id;
    }
    const profileTitle =
      this.role === '_profile_admin' ? 'administrator' :
        this.role === '_profile_teacher' ? 'teacher' :
          this.role === '_profile_student' ? 'student' :
          this.role === '_profile_assistant' ? 'student' : 'assistant';
    const data = {
      profile: evt,
      profileTitle: profileTitle,
      bulkPermissions: null,
      gSuiteSettings: gSuite,
      role: this.role,
      permissions: this.profilePermissions,
      disabledSignIn: this.showDisabledChip && this.role === '_profile_student'
    };

    if (this.selectedUsers.length && !bulk || this.role === '_all' && !gSuite)  {
      return false;
    }
    if (bulk && this.selectedUsers.length) {
      data.bulkPermissions = this.selectedUsers;
    }
    if (gSuite) {
      data.gSuiteSettings = gSuite;
    }

    const dialogRef = this.matDialog.open(ProfileCardDialogComponent, {
      panelClass: 'overlay-dialog',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '500px',
      data: data
    });

    dialogRef.afterClosed()
      .subscribe((userListReloadTrigger) => {
        if (userListReloadTrigger) {
          if (data.profile.id === +this.user.id) {
            this.userService.getUserRequest()
              .pipe(
                filter(res => !!res),
                map(raw => User.fromJSON(raw))
              )
              .subscribe((user) => {
                this.userService.userData.next(user);
              });

          }
          this.selectedUsers = [];
        }
        if (!this.searchValue) {
          this.querySubscriber$.next(this.userService.getAccountsRole(this.role));
        }
    });
  }

  private getUserList(query: string = '') {
    this.loaded = false;
    this.placeholder = false;
    this.userList = [];
    return this.userService
      .getAccountsRoles(this.role, query, 50)
      .pipe(
        tap((res) => {
          this.dataTableHeadersToDisplay = [];
        })
      );
  }

  syncNow() {
      this.adminService.syncNow().subscribe();
      this.adminService.getGSuiteOrgs().subscribe(res => this.GSuiteOrgs = res);
  }

  private wrapToHtml(data, htmlTag, dataIndex?) {
    const wrapper =  wrapToHtml.bind(this);
    return wrapper(data, htmlTag, dataIndex);
  }

  private buildUserListData(userList) {
    this.isLoadUsers = this.limitCounter === userList.length;
    return userList.map((raw, index) => {
      const permissionsRef: any = this.profilePermissions;
        const partOf = [];
        if (raw.roles.includes('_profile_student')) partOf.push({title: 'Student', role: '_profile_student'});
        if (raw.roles.includes('_profile_teacher')) partOf.push({title: 'Teacher', role: '_profile_teacher'});
        if (raw.roles.includes('_profile_assistant')) partOf.push({title: 'Assistant', role: '_profile_assistant'});
        if (raw.roles.includes('_profile_admin')) partOf.push({title: 'Administrator', role: '_profile_admin'});

        // const disabledSignIn = raw.roles.includes('_profile_student') && this.showDisabledChip;

        const rawObj = {
          'Name': raw.display_name,
          'Email/Username': (/@spnx.local/).test(raw.primary_email) ? raw.primary_email.slice(0, raw.primary_email.indexOf('@spnx.local')) : raw.primary_email,
          'rooms': raw.assignedTo && raw.assignedTo.length ? uniqBy(raw.assignedTo, 'id').map((room: any) => room.title) : [`<span style="cursor: not-allowed; color: #999999; text-decoration: none;">No rooms assigned</span>`],
          'Account Type': raw.sync_types[0] === 'google' ? 'G Suite' : raw.sync_types[0] === 'gg4l' ? 'GG4L' : 'Standard',
          'Acting on Behalf Of': raw.canActingOnBehalfOf ? raw.canActingOnBehalfOf.map((u: RepresentedUser) => {
            return `${u.user.display_name} (${u.user.primary_email.slice(0, u.user.primary_email.indexOf('@'))})`;
          }).join(', ') : '',
          'Sign-in status': raw.active ? 'Enabled' : 'Disabled',
          'Last sign-in': raw.last_login ? Util.formatDateTime(new Date(raw.last_login)) : 'Never signed in',
          'Group(s)': partOf.length ? partOf : [{title: 'No profile'}],
          'Permissions': (function() {
            const tabs = Object.values(permissionsRef).map((tab: any) => {
              tab.allowed = raw.roles.includes(tab.controlName);
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
          }())
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
          record['Name'] = this.wrapToHtml(`
          ${raw.display_name} <span style="
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
        Object.defineProperty(rawObj, 'last_sign_in', {enumerable: false, value: raw.last_login });
        Object.defineProperty(rawObj, '_originalUserProfile', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: raw
        });
        Object.defineProperty(record, '_data', { enumerable: false, value: rawObj });

        this.loaded = true;

      return record;
    });

  }

  loadMore($event) {
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
