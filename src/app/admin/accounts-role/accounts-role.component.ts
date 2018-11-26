import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material';
import {UserService} from '../../user.service';
import {AccountsDialogComponent} from '../accounts-dialog/accounts-dialog.component';
import { ActivatedRoute } from '@angular/router';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/internal/operators';

@Component({
  selector: 'app-accounts-role',
  templateUrl: './accounts-role.component.html',
  styleUrls: ['./accounts-role.component.scss']
})
export class AccountsRoleComponent implements OnInit, OnDestroy {

  private destroy$: Subject<any> = new Subject();
  private searchChangeObserver$: Subject<string>;

  public role: string;
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
  showSearchParam(searchValue) {
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
            // this.placeholder = false;
            this.userList = userList.map((raw) => {
              return {
                'Name': raw.display_name,
                'Account Email': raw.primary_email,
                'Last Sign-in': raw.last_updated,
                'Restrictions': 'None'
              };
            });
          } else {
            this.placeholder = true;
          }
        });
    }
    this.searchChangeObserver$.next(searchValue);
  }
  showSelected(e) {
    console.log(e);
    this.selectedUsers = e;
  }
  openDialog(mode) {
    const restrictions = this.role === '_profile_admin'
                                    ?
                        {
                          'dashboard_access': {
                            restriction: false,
                            controlName: 'dashboard_access',
                            controlLabel: 'Access to Dashboard'
                          },
                          'hall_monitor_access': {
                            controlName: 'hall_monitor_access',
                            restriction: true,
                            controlLabel: 'Access to Hall Monitor'
                          },
                          'search_access': {
                            controlName: 'search_access',
                            restriction: false,
                            controlLabel: 'Access to Search'
                          },
                          'accounts_access': {
                            controlName: 'accounts_access',
                            restriction: false,
                            controlLabel: 'Access to Accounts & Profiles'
                          },
                          'pass_config_access': {
                            controlName: 'pass_config_access',
                            restriction: true,
                            controlLabel: 'Access to Pass Configuration'
                          },
                          'school_setting_access': {
                            controlName: 'school_setting_access',
                            restriction: true,
                            controlLabel: 'Access to School Settings'
                          },
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
          this.userList = userList.map((raw) => {
            return {
              'Name': raw.display_name,
              'Account Email': raw.primary_email,
              'Last Sign-in': raw.last_updated,
              'Restrictions': 'None'
            };
          });
        } else {
          this.placeholder = true;
        }
      });
  }
}
