import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {UserService} from '../../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {Util} from '../../../Util';
import {HttpService} from '../../services/http-service';
import {AdminService} from '../../services/admin.service';
import {ProfileCardDialogComponent} from '../profile-card-dialog/profile-card-dialog.component';
import {User} from '../../models/User';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {RepresentedUser} from '../../navbar/navbar.component';
import {GSuiteOrgs} from '../../models/GSuiteOrgs';
import {DomSanitizer} from '@angular/platform-browser';
import {cloneDeep, uniqBy} from 'lodash';
import {School} from '../../models/School';
import {TableService} from '../sp-data-table/table.service';
import {TotalAccounts} from '../../models/TotalAccounts';
import {StorageService} from '../../services/storage.service';
import {ToastService} from '../../services/toast.service';

export const TABLE_RELOADING_TRIGGER =  new Subject<any>();


@Component({
  selector: 'app-accounts-role',
  templateUrl: './accounts-role.component.html',
  styleUrls: ['./accounts-role.component.scss']
})
export class AccountsRoleComponent implements OnInit, OnDestroy {

  private destroy$: Subject<any> = new Subject();

  public role: string;
  public placeholder: boolean;
  public loaded: boolean = false;
  public profilePermissions: any;
  public user: User;
  public pending$: Subject<boolean> = new Subject<boolean>();
  public userEmptyState: boolean;

  public GSuiteOrgs: GSuiteOrgs = <GSuiteOrgs>{};
  public searchValue: string;

  public sortingColumn: string;
  public currentColumns: any = {};

  accountRoleData$: Observable<any[]>;
  accountRoleNextUrl$: Observable<string>;

  isLoading$: Observable<boolean> = of(false);
  isLoaded$: Observable<boolean>;
  sort$: Observable<string>;
  sortLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public accounts$: Observable<TotalAccounts> = this.adminService.countAccounts$;

  schools$: Observable<School[]>;


  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private userService: UserService,
    private http: HttpService,
    private adminService: AdminService,
    private matDialog: MatDialog,
    private _zone: NgZone,
    public darkTheme: DarkThemeSwitch,
    private tableService: TableService,
    private sanitizer: DomSanitizer,
    private storage: StorageService,
    private toast: ToastService
  ) {

  }

  ngOnInit() {
    this.schools$ = this.http.schoolsCollection$;

    this.accountRoleData$ = this.http.globalReload$
      .pipe(
        switchMap(() => this.route.params),
        tap(params => {
          this.role = params.role;
          this.userService.getAccountsRoles(this.role, '', 50);
          this.buildPermissions();
          this.isLoaded$ = this.userService.getLoadingAccounts(this.role).loaded;
          this.isLoading$ = this.userService.getLoadingAccounts(this.role).loading;
          this.sort$ = this.userService.accountSort$[this.role];
          this.accountRoleNextUrl$ = this.userService.nextRequests$[this.role];
        }),
        switchMap(() => {
          return this.userService.getAccountsRole(this.role);
        }),
        map((accounts: User[]) => {
          this.sortLoading$.next(false);
          const getColumns = this.storage.getItem(`order${this.role}`);
          const columns = {};
          if (getColumns) {
            const columnsOrder = ('Name,' + getColumns).split(',');
            for (let i = 0; i < columnsOrder.length; i++) {
              Object.assign(columns, {[columnsOrder[i]]: null});
            }
            this.currentColumns = cloneDeep(columns);
          }
          if (!accounts.length) {
            this.userEmptyState = true;
           return this.emptyRoleObject(getColumns, this.currentColumns);
          }
          this.userEmptyState = false;
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
            // Object.defineProperty(rowObj, '_data', { enumerable: false, value: rowObj });

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

    this.toast.toastButtonClick$
      .pipe(
        filter((action) => action === 'open_profile'),
        switchMap(action => {
          return this.userService.addedAccount$[this.role].pipe(take(1));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(addedUser => {
        this.toast.closeToast();
        this.showProfileCard({
          _originalUserProfile: addedUser,
          'Last sign-in': 'Never signed in',
          'Type': 'Standard'
        });
      });

  }

  buildPermissions() {
    this.profilePermissions = {};
    if (this.role === '_profile_admin') {
      this.profilePermissions['access_admin_dashboard'] = {
        controlName: 'access_admin_dashboard',
        controlLabel: 'Dashboard tab Access',
      };
      this.profilePermissions['admin_hall_monitor'] = {
        controlName: 'admin_hall_monitor',
        controlLabel: 'Hall Monitor tab Access',
      };
      this.profilePermissions['access_admin_search'] = {
        controlName: 'access_admin_search',
        controlLabel: 'Explore tab Access',
      };
      this.profilePermissions['access_pass_config'] = {
        controlName: 'access_pass_config',
        controlLabel: 'Rooms tab Access',
      };
      this.profilePermissions['access_user_config'] = {
        controlName: 'access_user_config',
        controlLabel: 'Accounts tab Access',
      };
    }
    if (this.role === '_profile_teacher' || this.role === '_profile_assistant') {
      this.profilePermissions['access_passes'] = {
        controlName: 'access_passes',
        controlLabel: 'Passes tab Access'
      };
      this.profilePermissions['access_hall_monitor'] = {
        controlName: 'access_hall_monitor',
        controlLabel: 'Hall Monitor tab Access'
      };
      this.profilePermissions['access_teacher_room'] = {
        controlName: 'access_teacher_room',
        controlLabel: 'My Room tab Access'
      };
    }
  }

  emptyRoleObject(getColumns, columns) {
    if (this.role === '_profile_admin' || this.role === '_profile_student') {
      return getColumns ? [columns] : [{
        'Name': null,
        'Email/username': null,
        'Status': null,
        'Last sign-in': null,
        'Type': null,
        'Permissions': null
      }];
    } else if (this.role === '_profile_teacher') {
      return getColumns ? [columns] : [{
        'Name': null,
        'Email/username': null,
        'Rooms': null,
        'Status': null,
        'Last sign-in': null,
        'Type': null,
        'Permissions': null
      }];
    } else if (this.role === '_profile_assistant') {
      return getColumns ? [columns] : [{
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
      'Name': this.sanitizer.bypassSecurityTrustHtml(`<div class="no-wrap" style="width: 150px !important;">` + account.display_name + '</div>'),
      'Email/username': `<div class="no-wrap">` + account.primary_email.split('@spnx.local')[0] + '</div>',
    };
    let objectToTable;
    if (this.role === '_profile_admin' || this.role === '_profile_student') {
      objectToTable = {...roleObject, ...{
          'Status': `<span class="status">${account.status}</span>`,
          'Last sign-in': account.last_login && account.last_login !== new Date() ? Util.formatDateTime(new Date(account.last_login)) : 'Never signed in',
          'Type': account.demo_account ? 'Demo' : account.sync_types[0] === 'google' ? 'G Suite' : (account.sync_types[0] === 'gg4l' ? 'GG4L' : account.sync_types[0] === 'clever' ? 'Clever' : 'Standard'),
          'Permissions': `<div class="no-wrap">` + permissions + `</div>`
      }};
    } else if (this.role === '_profile_teacher') {
      objectToTable = {...roleObject, ...{
          'rooms': this.sanitizer.bypassSecurityTrustHtml(`<div class="no-wrap">` + (account.assignedTo && account.assignedTo.length ? uniqBy(account.assignedTo, 'id').map((room: any) => room.title).join(', ') : 'No rooms assigned') + `</div>`),
          'Status': `<span class="status">${account.status}</span>`,
          'Last sign-in': account.last_login ? Util.formatDateTime(new Date(account.last_login)) : 'Never signed in',
          'Type': account.demo_account ? 'Demo' : account.sync_types[0] === 'google' ? 'G Suite' : (account.sync_types[0] === 'gg4l' ? 'GG4L' : account.sync_types[0] === 'clever' ? 'Clever' : 'Standard'),
          'Permissions': `<div class="no-wrap">` + permissions + `</div>`
      }};
    } else if (this.role === '_profile_assistant') {
      objectToTable = {...roleObject, ...{
          'Acting on Behalf Of': this.sanitizer.bypassSecurityTrustHtml(`<div class="no-wrap">` + (account.canActingOnBehalfOf && account.canActingOnBehalfOf.length ? account.canActingOnBehalfOf.map((u: RepresentedUser) => {
            return `${u.user.display_name} (${u.user.primary_email.slice(0, u.user.primary_email.indexOf('@'))})`;
          }).join(', ') : 'No Teachers') + `</div>`),
          'Status': `<span class="status">${account.status}</span>`,
          'Last sign-in': account.last_login && account.last_login !== new Date() ? Util.formatDateTime(new Date(account.last_login)) : 'Never signed in',
          'Type': account.demo_account ? 'Demo' : account.sync_types[0] === 'google' ? 'G Suite' : (account.sync_types[0] === 'gg4l' ? 'GG4L' : account.sync_types[0] === 'clever' ? 'Clever' : 'Standard'),
          'Permissions': `<div class="no-wrap">` + permissions + `</div>`
      }};
    }
    const currentObj = {};
    if (this.storage.getItem(`order${this.role}`)) {
      Object.keys(this.currentColumns).forEach(key => {
        currentObj[key] = objectToTable[key];
      });
    }
    return this.storage.getItem(`order${this.role}`) ? currentObj : objectToTable;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCountAccounts(count: TotalAccounts): number {
    if (this.role === '_profile_admin') {
      return +count.admin_count;
    } else if (this.role === '_profile_teacher') {
      return +count.teacher_count;
    } else if (this.role === '_profile_student') {
      return +count.student_count;
    } else if (this.role === '_profile_assistant') {
      return +count.assistant_count;
    }
  }

  showProfileCard(evt) {
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
  }

  loadMore() {
    this.userService.getMoreUserListRequest(this.role);
  }

  sortingTable(sortColumn) {
    const queryParams: any = {};
    this.sortingColumn = sortColumn;
    this.sortLoading$.next(true);
    this.sort$
      .pipe(take(1))
      .subscribe(sort => {
        switch (sortColumn) {
          case 'Name':
            queryParams.sort = sort && sort === 'asc' ? '-last_name' : 'last_name';
            break;
          case 'Email/username':
            queryParams.sort = sort && sort === 'asc' ? '-email' : 'email';
            break;
          case 'Last sign-in':
            queryParams.sort = sort && sort === 'asc' ? '-last_sign_in' : 'last_sign_in';
            break;
          case 'Type':
            queryParams.sort = sort && sort === 'asc' ? '-sync_type' : 'sync_type';
            break;
          case 'rooms':
            queryParams.sort = sort && sort === 'asc' ? '-assigned_locations' : 'assigned_locations';
            break;
          default:
            this.sortLoading$.next(false);
            return;
        }
        if (sort === 'desc') {
          delete queryParams.sort;
        }
        queryParams.limit = 50;
        queryParams.role = this.role;
        this.userService.sortTableHeaderRequest(this.role, queryParams);
    });
  }
}
