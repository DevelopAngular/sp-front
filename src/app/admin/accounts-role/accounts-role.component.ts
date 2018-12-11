import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material';
import {UserService} from '../../user.service';
import {AccountsDialogComponent} from '../accounts-dialog/accounts-dialog.component';
import { ActivatedRoute } from '@angular/router';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/internal/operators';
import {Util} from '../../../Util';

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

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
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
  openDialog(mode) {
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
    const DR = this.matDialog.open(AccountsDialogComponent,
      {
        data: {
          role: this.role,
          selectedUsers: this.selectedUsers,
          mode: mode,
          restrictions: restrictions
        },
        width: '768px', height: '560px',
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd'
      });
    DR.afterClosed().subscribe(v => console.log(v));
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
