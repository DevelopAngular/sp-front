import {Component, ElementRef, NgZone, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {BehaviorSubject, Observable, of, Subject, zip} from 'rxjs';
import {UserService} from '../../services/user.service';
import {AccountsDialogComponent} from '../accounts-dialog/accounts-dialog.component';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil, tap} from 'rxjs/operators';
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
  public userAmount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public dataTableHeadersToDisplay: string[] = [];
  public userList: any[] = [];
  public selectedUsers: any[] = [];
  public placeholder: boolean;
  public consentMenuOpened: boolean = false;
  public dataTableHeaders: any;
  public profilePermissions: any;
  public initialSearchString: string;
  public tabVisibility: boolean = false;

  public accounts$ =
    new BehaviorSubject<any>({
      total: 0,
      admin_count: 0,
      student_count: 0,
      teacher_count: 0
    });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private http: HttpService,
    private adminService: AdminService,
    private matDialog: MatDialog,
    private _zone: NgZone,
    private storage: StorageService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    // debugger;
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
        console.log(params);

        if (this.role === '_all') {
          return this.adminService.getAdminAccounts()
            .pipe(tap((u_list: any) => {
              // console.log(u_list, Object.values(u_list));
              if (u_list.total_count !== undefined) {
                u_list.total = u_list.total_count;
              } else {
                u_list.total = Object.values(u_list).reduce((a: number, b: number) => a + b);
              }
              // console.log(u_list);
              this.accounts$.next(u_list);
            }));
        } else {
          return of(null);
        }
      }),
      switchMap(() => {
        return this.route.queryParams.pipe(takeUntil(this.destroy$));
      })
    )
    .subscribe((qp) => {
      console.log(qp);

      const {profileName} = qp;

        this.initialSearchString = this.initialSearchString ? this.initialSearchString : profileName;
        console.log(this.initialSearchString);
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
              this.dataTableHeaders['Profile(s)'] = {
                value: false,
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
            // restriction: true,
            controlName: 'admin_dashboard',
            controlLabel: 'Dashboard Tab Access'
          },
          'admin_hall_monitor': {
            controlName: 'admin_hall_monitor',
            // restriction: true,
            controlLabel: 'Hall Monitor Tab Access'
          },
          'admin_search': {
            controlName: 'admin_search',
            // restriction: true,
            controlLabel: 'Search Tab Access'
          },
          'admin_accounts': {
            controlName: 'admin_accounts',
            // restriction: true,
            controlLabel: 'Accounts & Profiles Tab Access'
          },
          'admin_pass_config': {
            controlName: 'admin_pass_config',
            // restriction: true,
            controlLabel: 'Pass Configuration Tab Access'
          },
          // 'admin_school_settings': {
          //   controlName: 'admin_school_settings',
          //   restriction: true,
          //   controlLabel: 'Access to School Settings'
          // },
        }
                   :
        this.role === '_profile_teacher'
                   ?
        {
          'admin_hall_monitor': {
            controlName: 'admin_hall_monitor',
            // restriction: true,
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
            this.userList = userList.map((raw, index) => {

              const partOf = [];
                if (raw.roles.includes('_profile_student')) partOf.push('Student');
                if (raw.roles.includes('_profile_teacher')) partOf.push('Teacher');
                if (raw.roles.includes('_profile_admin')) partOf.push('Administrator');

              const rawObj = {
                'Name': raw.display_name,
                'Email/Username': raw.primary_email,
                'Rooms': ['Room-1', 'Room-2'].join(','),
                'Account Type': 'G Suite',
                'Sign-in status': 'Enabled',
                'Last sign-in': Util.formatDateTime(new Date(raw.last_updated)),
                'Permissions': ['create_hallpasses', 'edit_all_hallpass', 'manage_locations'].join(','),
                'Profile(s)': partOf.join(', ')
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


          } else {
            this.placeholder = true;
          }
        });
    }

    this.searchChangeObserver$.next(searchValue);
  }

  showSelected(e) {
    if (e.length) {
      // console.log(e[0]['id']);
    }
    // console.log(e);
    this.selectedUsers = e;
  }

  openDialog(mode, eventTarget?: HTMLElement) {

    // =========== SPA=476 ============> It's temporary. Needs to suggest to leave the dialog as it is. If it will be declined, remove it.

    if ( mode === 'remove') {
      this.consentMenuOpened = true;
      const DR = this.matDialog.open(ConsentMenuComponent,
        {
          data: {
            role: this.role,
            selectedUsers: this.selectedUsers,
            mode: mode,
            restrictions: this.profilePermissions,
            alignSelf: true,
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
              return zip(...this.selectedUsers.map((user) => this.userService.deleteUserFromProfile(user['id'], role)));
            } else {
              return of(null);
            }

          }),
        )
        .subscribe((res) => {
          console.log(res);
          if (res != null) {
            this.http.setSchool(this.http.getSchool());
          }
        });
      return;
    }

    // =========== SPA=476 end ============>

    const DR = this.matDialog.open(AccountsDialogComponent,
      {
        data: {
          role: this.role,
          selectedUsers: this.selectedUsers,
          mode: mode,
          restrictions: this.profilePermissions
        },
        width: '1018px', height: '560px',
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd'
      });
    DR.afterClosed().subscribe((v) => {
      // console.log(v);
      this.http.setSchool(this.http.getSchool());
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
        width: '750px', height: '425px',
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
    });

  }

  findProfileByRole(evt) {
    console.log(evt);
    // this.tabVisibility = false;

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
    }, 1000);
  }

  showProfileCard(evt, bulk: boolean = false) {
    console.log(evt);

    if (this.selectedUsers.length && !bulk || this.role === '_all')  {
      return false;
    }

    const dialogRef = this.matDialog.open(ProfileCardDialogComponent, {
      panelClass: 'overlay-dialog',
      backdropClass: 'custom-bd',
      width: '395px',
      height: '474px',
      data: {
        profile: evt,
        bulkPermissions: bulk && this.selectedUsers.length ? this.selectedUsers.map(user => user.id) : null,
        role: this.role,
        permissions: this.profilePermissions
      }
    });


    dialogRef.afterClosed().subscribe((userListReloadTrigger: any) => {
      console.log(userListReloadTrigger);
      if (userListReloadTrigger) {
        this.selectedUsers = [];
        this.getUserList();
      }
    });
  }

  private getUserList(query: string = '') {

    this.placeholder = false;
    this.userList = [];
    this.userService
      .getUsersList(this.role, query)
      .pipe(
        tap(() => {
          this.dataTableHeadersToDisplay = [];
        }),
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
            // debugger;
            return of(userList);
          }
        })
      )
      .subscribe((userList: any) => {
        // console.log(userList);
        if (userList && userList.length) {
          this.placeholder = false;
          this.userAmount.next(userList.length);

          this.dataTableHeadersToDisplay = [];

          this.userList = userList.map((raw, index) => {

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
              'Permissions': ['create_hallpasses', 'edit_all_hallpass', 'manage_locations'].join(','),
              'Profile(s)': partOf

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
          console.log(this.dataTableHeadersToDisplay);
          console.log(this.userList);

        } else {
          this.placeholder = true;
        }
      });
  }
}
