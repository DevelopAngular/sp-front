import { Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material';
import {BehaviorSubject, Observable, of, Subject, zip} from 'rxjs';
import {UserService} from '../../services/user.service';
import {AccountsDialogComponent} from '../accounts-dialog/accounts-dialog.component';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
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
  public count: number = 0;
  // public userAmount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public dataTableHeadersToDisplay: string[] = [];
  public userList: any[] = [];
  public selectedUsers: any[] = [];
  public placeholder: boolean;
  public consentMenuOpened: boolean = false;
  public dataTableHeaders: any;
  public profilePermissions: any;
  public initialSearchString: string;
  public tabVisibility: boolean = false;
  public isLoadUsers: boolean = true;
  public user: User;
  private limitCounter: number = 20;

  public accounts$ =
    new BehaviorSubject<any>({
      total_count: 0,
      admin_count: 0,
      student_count: 0,
      teacher_count: 0
    });

  @ViewChild(DataTableComponent) dataTable;

  @HostListener('scroll', ['$event'])
  onScroll(event) {
    const target = event.target;
    const limit = target.scrollHeight - target.clientHeight;
    if (event.target.scrollTop === limit && this.isLoadUsers) {
      this.limitCounter += 20;
        this.userService
            .getUsersList(this.role, '', this.limitCounter)
            .pipe(
                takeUntil(this.destroy$),
                map(res => res.results),
                switchMap((userList) => {
                if (this.role === '_profile_teacher') {
                    return zip(
                        ...userList.map((user: User) => {
                            return this.dataService.getLocationsWithTeacher(user)
                                .pipe(
                                    switchMap((locs: Location[]) => {
                                        (user as any).assignedTo = locs;
                                        return of(user);
                                    })
                                );

                        }));
                } else {
                    return of(userList);
                }
            }))
            .subscribe(userList => {
              this.dataTableHeadersToDisplay = [];
              this.userList = this.buildUserListData(userList);
              this.selectedUsers = [];
              this.dataTable.clearSelection();
        });
    }
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private http: HttpService,
    private adminService: AdminService,
    private matDialog: MatDialog,
    private _zone: NgZone,
    private storage: StorageService,
    private elemRef: ElementRef,
    private dataService: DataService,
    public darkTheme: DarkThemeSwitch

  ) {}

  ngOnInit() {
    this.http.globalReload$.pipe(
      tap(() => {
        this.selectedUsers = [];
        this.userList = [];
      }),
      switchMap(() => {
        return this.route.params.pipe(takeUntil(this.destroy$));
      }),
      switchMap((params) => {
        this.role = params.role;

        // if (this.role === '_all') {
          return this.adminService.getAdminAccounts()
            .pipe(tap((u_list: any) => {
              console.log('This Accounts ==>>>', u_list);
              if (u_list.total_count !== undefined) {
                u_list.total = u_list.total_count;
              } else {
                u_list.total = Object.values(u_list).reduce((a: number, b: number) => a + b);
              }
              console.log(u_list);
              this.accounts$.next(u_list);
            }));
        // } else {
        //   return of(null);
        // }
      }),
      switchMap(() => {
        return this.route.queryParams.pipe(takeUntil(this.destroy$));
      })
    )
    .subscribe((qp) => {
      // console.log(qp);
      // debugger;

      const {profileName, count} = qp;

      this.count = count ? count : this.count;



      this.initialSearchString = this.initialSearchString ? this.initialSearchString : profileName;
        // console.log(this.initialSearchString);
      this.router.navigate(['admin/accounts', this.role]);
      this.tabVisibility = true;
      this.getUserList(this.initialSearchString || '');
      // this._zone.run(() => {
        const headers = this.storage.getItem(`${this.role}_columns`);
        if ( headers ) {

          this.dataTableHeaders = JSON.parse(headers);
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
              value: false,
              label: 'Account Type',
              disabled: false
            }
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

            case '_profile_admin':
              this.dataTableHeaders['Permissions'] = {
                value: false,
                label: 'Permissions',
                disabled: false
              };
              break;
            case '_all':
              this.dataTableHeaders['Account Type'].value = true;
              this.dataTableHeaders['Profile(s)'] = {
                value: true,
                label: 'Profile(s)',
                disabled: false
              };
          }
        }
      // });

      this.profilePermissions =
        this.role === '_profile_admin'
                   ?
        {
          'admin_dashboard': {
            controlName: 'admin_dashboard',
            controlLabel: 'Dashboard Tab Access',
            // allowed: this.user.roles.includes('admin_dashboard'),
          },
          'admin_hall_monitor': {
            controlName: 'admin_hall_monitor',
            controlLabel: 'Hall Monitor Tab Access',
            // allowed: this.user.roles.includes('admin_hall_monitor'),
          },
          'admin_search': {
            controlName: 'admin_search',
            controlLabel: 'Search Tab Access',
            // allowed: this.user.roles.includes('admin_search'),
          },
          'admin_accounts': {
            controlName: 'admin_accounts',
            controlLabel: 'Accounts & Profiles Tab Access',
            // allowed: this.user.roles.includes('admin_accounts'),
          },
          'admin_pass_config': {
            controlName: 'admin_pass_config',
            controlLabel: 'Pass Configuration Tab Access',
            // allowed: this.user.roles.includes('admin_pass_config'),
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
          'admin_hall_monitor': {
            controlName: 'admin_hall_monitor',
            // allowed: this.user.roles.includes('admin_hall_monitor'),
            controlLabel: 'Access to Hall Monitor'
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

    if (!this.searchChangeObserver$) {
      Observable.create(observer => {
        this.searchChangeObserver$ = observer;
      })
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          tap(() => {
            this.dataTableHeadersToDisplay = [];
          }),
          switchMap((value: string) => this.userService.getUsersList(this.role, value))
        )
        .subscribe((userList) => {
          if (userList && userList.length) {
            this.dataTableHeadersToDisplay = [];
            this.userList = this.buildUserListData(this.userList);
          } else {
            this.placeholder = true;
          }
        });
    }

    this.searchChangeObserver$.next(searchValue);
  }


  setSelected(e) {
    // if (e.length) {
      // console.log(e[0]['id']);
    // }
    this.selectedUsers = e;
  }


  deleteAccountPrompt(eventTarget: HTMLElement) {

      this.consentMenuOpened = true;
      const DR = this.matDialog.open(ConsentMenuComponent,
        {
          data: {
            role: this.role,
            selectedUsers: this.selectedUsers,
            restrictions: this.profilePermissions,
            header: `Are you sure you want to remove this user${this.selectedUsers.length > 1 ? 's' : ''}?`,
            // options: [{display: 'Confirm Remove', color: '#FFFFFF', buttonColor: '#DA2370, #FB434A', action: 'confirm'}],
            options: [{display: 'Confirm Delete', color: '#DA2370', buttonColor: '#DA2370, #FB434A', action: 'confirm'}],
            // optionsView: 'button',
            trigger: new ElementRef(eventTarget)
          },
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
        });
      DR.afterClosed()
        .pipe(
          switchMap((action): Observable<any> => {
            // console.log(action);
            this.consentMenuOpened = false;
            if (action === 'confirm') {
              let role: any = this.role.split('_');
                  role = role[role.length - 1];
              return zip(...this.selectedUsers.map((user) => this.userService.deleteUserFromProfile(user['id'], role))).pipe(map(() => true));
            } else {
              return of(false);
            }

          }),
        )
        .subscribe((res) => {
          console.log(res);
          if (res) {
            this.http.setSchool(this.http.getSchool());
            this.selectedUsers = [];
            this.getUserList();
          }
        });
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
    // console.log(evt);

    if (this.role === '_profile_admin') {
      if ((evt.id === +this.user.id)) {
        this.profilePermissions['admin_accounts'].disabled = true;
      } else {
        this.profilePermissions['admin_accounts'].disabled = false;
      }
    }

    const data = {
      profile: evt,
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
      data: data
    });


    dialogRef.afterClosed().subscribe((userListReloadTrigger: any) => {
      console.log(userListReloadTrigger, data.profile.id, this.user.id);
      if (userListReloadTrigger) {
        if (data.profile.id === +this.user.id) {
          window.document.location.reload();
        }
        this.selectedUsers = [];
        this.getUserList();
      }
    });
  }

  private getUserList(query: string = '') {

    this.placeholder = false;
    this.userList = [];
    this.userService
      .getUsersList(this.role, query, 20)
      .pipe(
        tap(() => {
          this.dataTableHeadersToDisplay = [];
        }),
        map(userResult => userResult.results),
        switchMap((userList: User[]) => {
          if (this.role === '_profile_teacher') {
            return zip(
              ...userList.map((user: User) => {
                return this.dataService.getLocationsWithTeacher(user)
                  .pipe(
                    switchMap((locs: Location[]) => {
                      (user as any).assignedTo = locs.map((l: Location) => {
                        return l.title;
                      }).join(', ');
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
        } else {
          this.placeholder = true;
        }
      });
  }

  private buildUserListData(userList) {
      this.isLoadUsers = this.limitCounter === userList.length;
      // this.userAmount.next(userList.length);
      return userList.map((raw, index) => {

        const permissionsRef: any = this.profilePermissions;
          const partOf = [];
          if (raw.roles.includes('_profile_student')) partOf.push({title: 'Student', role: '_profile_student'});
          if (raw.roles.includes('_profile_teacher')) partOf.push({title: 'Teacher', role: '_profile_teacher'});
          if (raw.roles.includes('_profile_admin')) partOf.push({title: 'Administrator', role: '_profile_admin'});

          const rawObj = {
              'Name': raw.display_name,
              'Email/Username': raw.primary_email,
              'Rooms': raw.assignedTo,
              'Account Type': 'G Suite',
              'Sign-in status': 'Enabled',
              'Last sign-in': Util.formatDateTime(new Date(raw.last_updated)),
              'Profile(s)': partOf,
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
          Object.defineProperty(rawObj, 'id', { enumerable: false, value: raw.id});
          Object.defineProperty(rawObj, '_originalUserProfile', {
              enumerable: false,
              configurable: false,
              writable: false,
              value: raw
          });
          return  rawObj;
      });
  }
}
