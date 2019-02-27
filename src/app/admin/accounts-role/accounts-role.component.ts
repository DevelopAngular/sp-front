import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject, zip} from 'rxjs';
import {MatDialog} from '@angular/material';
import {UserService} from '../../services/user.service';
import {AccountsDialogComponent} from '../accounts-dialog/accounts-dialog.component';
import { ActivatedRoute } from '@angular/router';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil, tap} from 'rxjs/operators';
import {Util} from '../../../Util';
import {HttpService} from '../../services/http-service';
import {ConsentMenuComponent} from '../../consent-menu/consent-menu.component';
import {AdminService} from '../../services/admin.service';

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
  public userList: any[] = [];
  public selectedUsers: any[] = [];
  public placeholder: boolean;
  public consentMenuOpened: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private http: HttpService,
    private adminService: AdminService,
    private matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.http.globalReload$.pipe(
      tap(() => {
        this.selectedUsers = [];
        this.userList = [];
      }),
      switchMap(() => {
        return this.route.params.pipe(takeUntil(this.destroy$));
      })
    )
    .subscribe((params: any) => {
      console.log(params);
      this.role = params.role;
      this.getUserList();
    });
  }
  findRelevantAccounts(searchValue) {
    console.log(searchValue);
    this.placeholder = false;
    this.userList = [];

    if (!this.searchChangeObserver$) {
      Observable.create(observer => {
        this.searchChangeObserver$ = observer;
      })
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((value: string) => this.userService.getUsersList(this.role, value))
        )
        .subscribe((userList) => {
          if (userList && userList.length) {
            // this.userAmount.next(userList.length);
            this.userList = userList.map((raw) => {
              const rawObj = {
                'Name': raw.display_name,
                'Account Email': raw.primary_email,
                'Last Sign-in': Util.formatDateTime(new Date(raw.last_updated)),
              };
              Object.defineProperty(rawObj, '#Id', { enumerable: false, value: raw.id});
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
      console.log(e[0]['#Id']);

    }
    this.selectedUsers = e;
  }

  openDialog(mode, eventTarget?: HTMLElement) {
    const restrictions = this.role === '_profile_admin'
                                    ?
                        {
                          'admin_dashboard': {
                            restriction: true,
                            controlName: 'admin_dashboard',
                            controlLabel: 'Access to Dashboard'
                          },
                          'admin_hall_monitor': {
                            controlName: 'admin_hall_monitor',
                            restriction: true,
                            controlLabel: 'Access to Hall Monitor'
                          },
                          'admin_search': {
                            controlName: 'admin_search',
                            restriction: true,
                            controlLabel: 'Access to Search'
                          },
                          'admin_accounts': {
                            controlName: 'admin_accounts',
                            restriction: true,
                            controlLabel: 'Access to Accounts & Profiles'
                          },
                          'admin_pass_config': {
                            controlName: 'admin_pass_config',
                            restriction: true,
                            controlLabel: 'Access to Pass Configuration'
                          },
                          // 'admin_school_setting': {
                          //   controlName: 'admin_school_setting',
                          //   restriction: true,
                          //   controlLabel: 'Access to School Settings'
                          // },
                        }
                                    :
                        {
                          'hall_monitor_access': {
                            controlName: 'hall_monitor_access',
                            restriction: true,
                            controlLabel: 'Access to Hall Monitor'
                          },
                        };

    // =========== SPA=476 ============> It's temporary. Needs to suggest to leave the dialog as it is. If it will be declined, remove it.

    if ( mode === 'remove') {

      this.consentMenuOpened = true;

      const DR = this.matDialog.open(ConsentMenuComponent,
        {
          data: {
            role: this.role,
            selectedUsers: this.selectedUsers,
            mode: mode,
            restrictions: restrictions,
            alignSelf: true,
            header: `Are you sure you want to remove this user${this.selectedUsers.length > 1 ? 's' : ''}?`,
            options: [{display: 'Confirm Remove', color: '#FFFFFF', buttonColor: '#DA2370, #FB434A', action: 'confirm'}],
            optionsView: 'button',
            trigger: new ElementRef(eventTarget)
          },
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
        });
      DR.afterClosed()
        .pipe(
          switchMap((action): Observable<any> => {
            console.log(action);
            this.consentMenuOpened = false;
            if (action === 'confirm') {
              let role: any = this.role.split('_');
                  role = role[role.length - 1];
              console.log('======>>>>>', role, this.selectedUsers);
              return zip(...this.selectedUsers.map((user) => this.userService.deleteUserFromProfile(user['#Id'], role)));
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
          restrictions: restrictions
        },
        width: '1018px', height: '560px',
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd'
      });
    DR.afterClosed().subscribe((v) => {
      console.log(v);
      this.http.setSchool(this.http.getSchool());
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private getUserList(query: string = '') {
    this.placeholder = false;
    this.userService
      .getUsersList(this.role, query)
      .subscribe((userList) => {
        if (userList && userList.length) {
          this.placeholder = false;
          this.userAmount.next(userList.length);
          this.userList = userList.map((raw) => {
            const rawObj = {
              'Name': raw.display_name,
              'Account Email': raw.primary_email,
              'Last Sign-in': Util.formatDateTime(new Date(raw.last_updated)),
            };
            Object.defineProperty(rawObj, '#Id', { enumerable: false, value: raw.id});
            return  rawObj;
          });
        } else {
          this.placeholder = true;
        }
      });
  }
}
