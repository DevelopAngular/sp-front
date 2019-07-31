import {Component, ElementRef, HostListener, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material';
import {BehaviorSubject, interval, Observable, of, Subject, zip} from 'rxjs';
import {UserService} from '../../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, filter, map, share, startWith, switchMap, takeUntil, tap} from 'rxjs/operators';
import {Util} from '../../../Util';
import {HttpService} from '../../services/http-service';
import {ConsentMenuComponent} from '../../consent-menu/consent-menu.component';
import {AdminService} from '../../services/admin.service';
import {ColumnsConfigDialogComponent} from '../columns-config-dialog/columns-config-dialog.component';
import {StorageService} from '../../services/storage.service';
import {ProfileCardDialogComponent} from '../profile-card-dialog/profile-card-dialog.component';
import {AddUserDialogComponent} from '../add-user-dialog/add-user-dialog.component';
import {User} from '../../models/User';
import {DataService} from '../../services/data-service';
import {Location} from '../../models/Location';
import {DataTableComponent} from '../data-table/data-table.component';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {RepresentedUser} from '../../navbar/navbar.component';
import {LocationsService} from '../../services/locations.service';
import {GSuiteOrgs} from '../../models/GSuiteOrgs';

declare const window;

export const TABLE_RELOADING_TRIGGER =  new Subject<any>();


@Component({
  selector: 'app-accounts-role',
  templateUrl: './accounts-role.component.html',
  styleUrls: ['./accounts-role.component.scss']
})
export class AccountsRoleComponent implements OnInit, OnDestroy {

  private destroy$: Subject<any> = new Subject();
  private searchChangeObserver$: Subject<string>;

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

  public syncingDots: string;

  public accounts$ =
    new BehaviorSubject<any>({
      total_count: null,
      admin_count: null,
      student_count: null,
      teacher_count: null,
      assistant_count: null
    });

    ////// G_Suite

  public syncing = {
    intervalId: null,
    enabled: false,
    syncingDots: '',
    // destroyer$: new Subject<any>(),
    start() {
      if (this.enabled) {
        return;
      }
      this.enabled = true;
      let dot = 0;
      this.intervalId = interval(250)
        .pipe(
          map(() => {
            dot += 1;
            if (dot > 3) {
              dot = 0;
            }
            return dot;
          }),
          // takeUntil(this.destroyer$)
        )
        .subscribe((res) => {
          // console.log(res);
          switch (res) {
            case 0:
              this.syncingDots = '';
              break;
            case 1:
              this.syncingDots = '.';
              break;
            case 2:
              this.syncingDots = '..';
              break;
            case 3:
              this.syncingDots = '...';
              break;
          }
        });
    },
    end() {
      if (!this.enabled) {
        return;
      }
      this.enabled = false;
      this.syncingDots = '';
      this.intervalId.unsubscribe();
      // this.destroyer$.next();
      // this.destroyer$.complete();
    }
  };

  public GSuiteOrgs: GSuiteOrgs = <GSuiteOrgs>{};

  public countAccounts = 2500;

  @ViewChild(DataTableComponent) dataTable;

  // @HostListener('scroll', ['$event'])
  // onScroll(event) {
  //   const target = event.target;
  //   const limit = target.scrollHeight - target.clientHeight;
  //   if (event.target.scrollTop === limit && this.isLoadUsers) {
  //     this.limitCounter += 20;
  //       this.userService
  //         .getUsersList(this.role, '', this.limitCounter)
  //         .pipe(
  //           takeUntil(this.destroy$),
  //           map(res => res.results),
  //           switchMap((userList: User[]) => {
  //             if (this.role === '_profile_teacher' && userList.length) {
  //               return this.addUserLocations(userList);
  //             } else if (this.role === '_profile_assistant' && userList.length) {
  //               return zip(
  //                 ...userList.map((user: User) => {
  //                   return this.userService.getRepresentedUsers(user.id)
  //                     .pipe(
  //                       switchMap((ru: RepresentedUser[]) => {
  //                         (user as any).canActingOnBehalfOf = ru;
  //                         return of(user);
  //                       })
  //                     );
  //                 }));
  //             } else {
  //               return of(userList);
  //             }
  //           })
  //         )
  //         .subscribe(userList => {
  //           this.dataTableHeadersToDisplay = [];
  //           this.userList = this.buildUserListData(userList);
  //           this.selectedUsers = [];
  //           if (this.dataTable) {
  //             this.dataTable.clearSelection();
  //           }
  //         });
  //   }
  // }

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private http: HttpService,
    private adminService: AdminService,
    private matDialog: MatDialog,
    private _zone: NgZone,
    private storage: StorageService,
    private elemRef: ElementRef,
    private dataService: DataService,
    public darkTheme: DarkThemeSwitch,
    private locService: LocationsService

  ) {}

  get noUsersDummyVisibility() {
    switch (this.role) {
      case '_profile_admin':
        return this.accounts$.value.admin_count === 0 && !this.loaded;
        break;
      case '_profile_teacher':
        return this.accounts$.value.teacher_count === 0 && !this.loaded;
        break;
      case '_profile_student':
        return this.accounts$.value.student_count === 0 && !this.loaded;
        break;
      case '_profile_assistant':
        return this.accounts$.value.assistant_count === 0 && !this.loaded;
        break;
    }
  }

  get bulkSignInStatus() {
    return this.selectedUsers.every(profile => profile._originalUserProfile.active);
  }

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  ngOnInit() {
    // this.syncing.start();

    interval(1758)
      .pipe(
        switchMap((res) => {
          return this.adminService.getGSuiteOrgs();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res: any) => {
        if (res.is_syncing) {
          this.syncing.start();
          // console.log(res);
        } else if (!res.is_syncing) {
          this.syncing.end();
        }
        for (const key in res) {
          if (this.GSuiteOrgs[key] !== res[key]) {
            this.GSuiteOrgs[key] = res[key];
          }
        }
      });

    this.http.globalReload$.pipe(
      tap(() => {
        this.role = null;
        this.selectedUsers = [];
        this.userList = [];
      }),
      switchMap(() => {
        return this.route.params.pipe(takeUntil(this.destroy$));
      }),
      switchMap((params) => {
        this.role = params.role;
          return this.adminService.getAdminAccounts()
            .pipe(tap((u_list: any) => {
              // console.log('This Accounts ==>>>', u_list);
              if (u_list.total_count !== undefined) {
                u_list.total = u_list.total_count;
              } else {
                u_list.total = Object.values(u_list).reduce((a: number, b: number) => a + b);
              }
              // console.log(u_list);
              this.accounts$.next(u_list);
            }));
      }),
      switchMap(() => {
        return this.route.queryParams.pipe(takeUntil(this.destroy$));
      }),
      tap(() => this.router.navigate(['admin/accounts', this.role])),
      filter(() => this.role !== 'g_suite'),
      takeUntil(this.destroy$)
    )
    .subscribe((qp) => {
      const {profileName} = qp;
      this.initialSearchString = this.initialSearchString ? this.initialSearchString : profileName;
      this.tabVisibility = true;
      this.getUserList(this.initialSearchString || '');
        const headers = this.storage.getItem(`${this.role}_columns`);
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
          };

          if (this.role !== '_all') {
            this.dataTableHeaders['Sign-in status'] = {
              value: true,
                label: 'Sign-in status',
                disabled: false
            };
            this.dataTableHeaders['Last sign-in'] = {
              value: true,
                label: 'Last sign-in',
                disabled: false
            };
          }

          switch (this.role) {
            case '_profile_teacher':
              this.dataTableHeaders['Rooms'] = {
                value: true,
                label: 'Rooms',
                disabled: false
              };
              this.dataTableHeaders['Permissions'] = {
                value: false,
                label: 'Permissions',
                disabled: false
              };
              break;
            case '_profile_assistant':
              this.dataTableHeaders['Acting on Behalf Of'] = {
                value: true,
                label: 'Acting on Behalf Of',
                disabled: false
              };
              this.dataTableHeaders['Permissions'] = {
                value: false,
                label: 'Permissions',
                disabled: false
              };
              break;
            case '_profile_admin':
              this.dataTableHeaders['Permissions'] = {
                value: false,
                label: 'Permissions',
                disabled: false
              };
              break;
            case '_all':
              // this.dataTableHeaders['Account Type'].value = true;
              this.dataTableHeaders['Profile(s)'] = {
                value: true,
                label: 'Profile(s)',
                disabled: false
              };
          }
        }

      this.profilePermissions =
        this.role === '_profile_admin'
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
            controlLabel: 'Accounts & Profiles Tab Access',
          },
          'access_pass_config': {
            controlName: 'access_pass_config',
            controlLabel: 'Pass Configuration Tab Access',
          },
          // 'admin_school_settings': {
          //   controlName: 'admin_school_settings',
          //   allowed: true,
          //   controlLabel: 'Access to School Settings'
          // },
        }
                   :
        this.role === '_profile_teacher'
                   ?
        {
          'access_hall_monitor': {
            controlName: 'access_hall_monitor',
            // allowed: this.user.roles.includes('admin_hall_monitor'),
            controlLabel: 'Access to Hall Monitor'
          },
        }
                   :
        this.role === '_profile_assistant'
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
    });

    TABLE_RELOADING_TRIGGER.subscribe((updatedHeaders) => {
      this.dataTableHeaders = updatedHeaders;
      this.getUserList('');
    });
    this.userService.userData.subscribe((user) => {
      this.user = user;
    });
  }

  findRelevantAccounts(searchValue) {
    // console.log(searchValue);
    this.placeholder = false;
    this.userList = [];
    this.pending$.next(true);

    if (!this.searchChangeObserver$) {
      Observable.create(observer => {
        this.searchChangeObserver$ = observer;
      })
        .pipe(
          debounceTime(100),
          distinctUntilChanged(),
          tap(() => {
            this.dataTableHeadersToDisplay = [];
          }),
          switchMap((value: string) =>
            this.userService.getUsersList(this.role, value).pipe(
              takeUntil(this.destroy$),
              map(res => res),
              switchMap((userList: User[]) => {
                if (this.role === '_profile_teacher' && userList.length) {
                  return this.addUserLocations(userList);
                } else if (this.role === '_profile_assistant' && userList.length) {
                  return zip(
                    ...userList.map((user: User) => {
                      return this.userService.getRepresentedUsers(user.id)
                        .pipe(
                          switchMap((ru: RepresentedUser[]) => {
                            (user as any).canActingOnBehalfOf = ru;
                            return of(user);
                          })
                        );
                    }));
                } else {
                  return of(userList);
                }
              })
          ))
        )
        .subscribe((userList) => {
          // console.log(userList);
          if (userList && userList.length) {
            this.dataTableHeadersToDisplay = [];
            this.userList = this.buildUserListData(userList);
            console.log(this.userList);
          } else {
            this.placeholder = true;
          }
          this.pending$.next(false);

        });
    }

    this.searchChangeObserver$.next(searchValue);
  }


  setSelected(e) {
    console.log(e);
    this.selectedUsers = e;
  }

  exportAccountData() {
    this.userService.exportUserData(this.selectedUsers[0].id)
      .subscribe(res => console.log(res));
  }

  promptConfirmation(eventTarget: HTMLElement, option: string = '') {

    if (!eventTarget.classList.contains('button')) {
      (eventTarget as any) = eventTarget.closest('.button');
    }

    eventTarget.style.opacity = '0.75';
      // this.consentMenuOpened = true;
    let header: string;
    let options: any[];
    const profile: string =
      this.role === '_profile_admin' ? 'administrator' :
      this.role === '_profile_teacher' ? 'teacher' :
      this.role === '_profile_student' ? 'student' :
      this.role === '_profile_assistant' ? 'assistant' : 'unknown';

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
        if (this.role === '_all') {
          header = `Are you sure you want to permanently delete ${this.selectedUsers.length > 1 ? 'these accounts' : 'this account'} and all associated data? This cannot be undone.`;
        } else {
          header = `Removing ${this.selectedUsers.length > 1 ? 'these users' : 'this user'} from the ${profile} group will remove them from this group, but it will not delete all data associated with the account.`;
        }
        options = [{display: `Confirm  ${this.role === '_all' ? 'Delete' : 'Remove'}`, color: '#DA2370', buttonColor: '#DA2370, #FB434A', action: 'delete_from_profile'}];
        break;
      case 'disable_sign_in':
        header = `Disable sign-in to prevent ${this.selectedUsers.length > 1 ? 'these users' : 'this user'} from being able to sign in with the ${profile} group.`;
        options = [{display: 'Disable sign-in', color: '#001115', buttonColor: '#001115, #033294', action: 'disable_sign_in'}];
        break;
      case 'enable_sign_in':
        header = `Enable sign-in to allow ${this.selectedUsers.length > 1 ? 'these users' : 'this user'} to be able to sign in with the ${profile} group.`;
        options = [{display: 'Enable sign-in', color: '#03CF31', buttonColor: '#03CF31, #00B476', action: 'enable_sign_in'}];
        break;
    }
      const DR = this.matDialog.open(ConsentMenuComponent,
        {
          data: {
            role: this.role,
            selectedUsers: this.selectedUsers,
            restrictions: this.profilePermissions,
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
                let role: any = this.role.split('_');
                    role = role[role.length - 1];
                    if (role === 'all') {
                      return zip(...this.selectedUsers.map((user) => this.userService.deleteUser(user['id']))).pipe(map(() => true));
                    } else {
                      return zip(...this.selectedUsers.map((user) => this.userService.deleteUserFromProfile(user['id'], role))).pipe(map(() => true));
                    }
                break;
              case 'disable_sign_in':
                return zip(...this.selectedUsers.map((user) => this.userService.setUserActivity(user['id'], false))).pipe(map(() => true));
                break;
              case 'enable_sign_in':
                return zip(...this.selectedUsers.map((user) => this.userService.setUserActivity(user['id'], true))).pipe(map(() => true));
                break;
              default:
                return of(false);
                break;
            }
          }),
        )
        .subscribe(consentMenuObserver);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showColumnSettings(evt: Event) {
    this.matDialog.open(ColumnsConfigDialogComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': evt.currentTarget,
        'form': this.dataTableHeaders,
        'role': this.role
       }
    });
  }

  addUser() {
    const DR = this.matDialog.open(AddUserDialogComponent,
      {
        width: '425px', height: '500px',
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd',
        data: {
          role: this.role,
          selectedUsers: this.selectedUsers,
          permissions: this.profilePermissions
        }
      });
    DR.afterClosed().subscribe((v) => {
      // console.log(v);
      this.http.setSchool(this.http.getSchool());
      if (v) {
        this.selectedUsers = [];
        this.getUserList();
      }
    });
  }

  findProfileByRole(evt) {
    // console.log(evt);
      console.log(evt);
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
    console.log(evt);

    if (this.role === '_profile_admin') {
      if ((evt.id === +this.user.id)) {
        this.profilePermissions['access_user_config'].disabled = true;
      } else {
        this.profilePermissions['access_user_config'].disabled = false;
      }
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
      permissions: this.profilePermissions
    }

    if (this.selectedUsers.length && !bulk || this.role === '_all' && !gSuite)  {
      return false;
    }
    if (bulk && this.selectedUsers.length) {
      data.bulkPermissions = this.selectedUsers.map(user => user.id);
    }
    if (gSuite) {
      data.gSuiteSettings = gSuite;
    }

    const dialogRef = this.matDialog.open(ProfileCardDialogComponent, {
      panelClass: 'overlay-dialog',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '500px',
      data: data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((userListReloadTrigger: any) => {
      console.log(userListReloadTrigger, data.profile.id, this.user.id);
      if (userListReloadTrigger) {
        if (data.profile.id === +this.user.id) {
          // window.document.location.reload();
          this.userService.getUser()
            .pipe(
              map(raw => User.fromJSON(raw))
            )
            .subscribe((user) => {
            this.userService.userData.next(user);
          });

        }
        this.selectedUsers = [];
        this.getUserList();
      }
    });
  }

  private getUserList(query: string = '') {
    this.loaded = false;
    this.placeholder = false;
    this.userList = [];
    this.userService
      .getUsersList(this.role, query, 100000)
      .pipe(
        tap(() => {
          this.dataTableHeadersToDisplay = [];
        }),
        map(userResult => userResult.results),
        switchMap((userList: User[]) => {
          if (this.role === '_profile_teacher' && userList.length) {

            return this.addUserLocations(userList);

          } else if (this.role === '_profile_assistant' && userList.length) {
            return zip(
              ...userList.map((user: User) => {
                return this.userService.getRepresentedUsers(user.id)
                  .pipe(
                    switchMap((ru: RepresentedUser[]) => {
                      (user as any).canActingOnBehalfOf = ru;
                      return of(user);
                    })
                  );

              }));
          } else {
            return of(userList);
          }
        })
      )
      .subscribe((userList: any) => {
        if (userList && userList.length) {
          this.placeholder = false;
          this.dataTableHeadersToDisplay = [];
          this.userList = this.buildUserListData(userList);
          console.log(this.userList);
        } else {
          this.placeholder = true;
        }
      });
  }

  syncNow() {
    this.adminService.syncNow().subscribe();
        this.adminService.getGSuiteOrgs().subscribe(res => this.GSuiteOrgs = res);
  }

  private addUserLocations(users) {
    return this.locService.getLocatopnsWithManyTeachers(users)
      .pipe(map((locs: Location[]) => {
        users.forEach(user => {
          (user as any).assignedTo = locs.filter(loc => loc.teachers.find(teacher => teacher.id === user.id));
        });
        return users;
      }));
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

        const rawObj = {
          'Name': raw.display_name,
          'Email/Username': (/@spnx.local/).test(raw.primary_email) ? raw.primary_email.slice(0, raw.primary_email.indexOf('@spnx.local')) : raw.primary_email,
          'Rooms': (function() {
            if (raw.assignedTo.length) {
              return raw.assignedTo.map((room) => {
                 return `<span>${room.title}</span>`;
              }).join(raw.assignedTo.length > 1 ? ', ' : '');
            } else {
              return `<span>No rooms assigned</span>`;
            }

          }()),
          'Account Type': raw.sync_types[0] === 'google' ? 'G Suite' : 'Standard',
          'Acting on Behalf Of': raw.canActingOnBehalfOf ? raw.canActingOnBehalfOf.map((u: RepresentedUser) => {
            return `${u.user.display_name} (${u.user.primary_email.slice(0, u.user.primary_email.indexOf('@'))})`;
          }).join(', ') : '',
          'Sign-in status': raw.active ? 'Enabled' : 'Disabled',
          'Last sign-in': raw.last_login ? Util.formatDateTime(new Date(raw.last_login)) : 'Never signed in',
          'Profile(s)': partOf.length ? partOf : [{title: 'No profile'}],
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
        Object.defineProperty(rawObj, 'id', { enumerable: false, value: raw.id });
        Object.defineProperty(rawObj, 'me', { enumerable: false, value: +raw.id === +this.user.id });
        Object.defineProperty(rawObj, '_originalUserProfile', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: raw
        });
        this.loaded = true;
        return  rawObj;
    });
  }
}
