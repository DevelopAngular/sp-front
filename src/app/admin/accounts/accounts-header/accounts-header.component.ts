import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {Router} from '@angular/router';
import {combineLatest, Observable, of, Subject, zip} from 'rxjs';
import {TotalAccounts} from '../../../models/TotalAccounts';
import {AdminService} from '../../../services/admin.service';
import {DarkThemeSwitch} from '../../../dark-theme-switch';
import {MatDialog} from '@angular/material';
import {AddUserDialogComponent} from '../../add-user-dialog/add-user-dialog.component';
import {User} from '../../../models/User';
import {UNANIMATED_CONTAINER} from '../../../consent-menu-overlay';
import {ConsentMenuComponent} from '../../../consent-menu/consent-menu.component';
import {filter, map, mapTo, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {UserService} from '../../../services/user.service';
import {AddAccountPopupComponent} from '../add-account-popup/add-account-popup.component';
import {BulkAddComponent} from '../bulk-add/bulk-add.component';
import {SchoolSyncInfo} from '../../../models/SchoolSyncInfo';
import {IntegrationsDialogComponent} from '../integrations-dialog/integrations-dialog.component';
import {Ggl4SettingsComponent} from '../ggl4-settings/ggl4-settings.component';
import {GSuiteSettingsComponent} from '../g-suite-settings/g-suite-settings.component';
import {GSuiteOrgs} from '../../../models/GSuiteOrgs';
import {TableService} from '../../sp-data-table/table.service';
import {PermissionsDialogComponent} from '../../accounts-role/permissions-dialog/permissions-dialog.component';
import {StatusPopupComponent} from '../../profile-card-dialog/status-popup/status-popup.component';

@Component({
  selector: 'app-accounts-header',
  templateUrl: './accounts-header.component.html',
  styleUrls: ['./accounts-header.component.scss']
})
export class AccountsHeaderComponent implements OnInit, AfterViewInit {

  @Input() pending$: Subject<boolean>;
  @Input() schoolSyncInfoData: SchoolSyncInfo;
  @Input() gSuiteOrgs: GSuiteOrgs;
  @Input() showTabs: boolean = true;

  @Output() tableStateEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() searchValueEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentPageEmit: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('tabPointer') tabPointer: ElementRef;
  @ViewChild('navButtonsContainer') navButtonsContainerRef: ElementRef;
  @ViewChildren('tabRef') tabRefs: QueryList<ElementRef>;

  tableState: boolean;
  openTable: boolean;
  pts: string;
  currentTab: string;
  forceFocus$: Subject<boolean> = new Subject<boolean>();

  selectedUsers: User[] = [];

  destroy$ = new Subject();

  public accounts$: Observable<TotalAccounts> = this.adminService.countAccounts$;

  public accountsButtons = [
    // { title: 'Overview', param: '', icon_id: '#Overview' },
    { title: 'Students', param: '_profile_student', icon_id: '#Student', role: 'student_count' },
    { title: 'Teachers', param: '_profile_teacher', icon_id: '#Teacher', role: 'teacher_count' },
    { title: 'Admins', param: '_profile_admin', icon_id: '#Admin', role: 'admin_count' },
    { title: 'Assistants', param: '_profile_assistant', icon_id: '#Assistant', role: 'assistant_count' }
  ];

  constructor(
    private adminService: AdminService,
    public darkTheme: DarkThemeSwitch,
    private matDialog: MatDialog,
    private userService: UserService,
    private router: Router,
    private tableService: TableService
  ) { }

  ngOnInit() {
    this.getCurrentTab();
    if (this.showTabs && this.currentTab === '') {
      this.router.navigate(['admin/accounts', '_profile_student']);
    }
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.selectedUsers = [];
      this.getCurrentTab();
    });

    this.tableService.selectRow.asObservable()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((selected) => {
          // return this.userService.accountsEntities[this.currentTab].pipe(
          //   withLatestFrom(of(selected))
          // );
          return combineLatest(
            of(selected),
            this.userService.accountsEntities[this.currentTab].pipe(take(1))
          );
        }),
        map(([selected, users]) => {
          return selected.map(user => users[user.id]);
        })
      )
      .subscribe(res => {
        this.selectedUsers = res;
      });

  }

  ngAfterViewInit(): void {
    this.setCurrentUnderlinePos(this.tabRefs, this.navButtonsContainerRef);
  }

  getCurrentTab() {
    const urlSplit: string[] = this.router.url.split('/');
    this.currentTab = urlSplit[urlSplit.length - 1] === 'accounts' ? '' : urlSplit[urlSplit.length - 1];
    this.currentPageEmit.emit(this.currentTab);
  }

  getCountAccounts(count: TotalAccounts) {
    if (this.currentTab === '_profile_admin') {
      return count.admin_count + ' admins';
    } else if (this.currentTab === '_profile_teacher') {
      return count.teacher_count + ' teachers';
    } else if (this.currentTab === '_profile_student') {
      return count.student_count + ' students';
    } else if (this.currentTab === '_profile_assistant') {
      return count.assistant_count + ' assistants';
    }
  }

  addUser(element) {
    const AAD = this.matDialog.open(AddAccountPopupComponent, {
      panelClass: 'calendar-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        trigger: new ElementRef(element.currentTarget),
        syncData: this.schoolSyncInfoData
      }
    });
    AAD.afterClosed().pipe(filter(res => !!res)).subscribe(action => {
      if (action === 'gg4l' || action === 'g_suite' || action === 'standard') {
        const DR = this.matDialog.open(AddUserDialogComponent, {
          width: '425px', height: '500px',
          panelClass: 'accounts-profiles-dialog',
          backdropClass: 'custom-bd',
          data: {
            role: !this.currentTab ? '_all' : this.currentTab,
            title: (action === 'gg4l' ? 'Add GG4L' : action === 'g_suite' ? 'Add G Suite' : 'Add') + ' Account',
            syncInfo: this.schoolSyncInfoData,
            icon: action === 'gg4l' ? './assets/GG4L Icon.svg' : action === 'g_suite' ? './assets/Google (White).svg' : './assets/Add Account (White).svg',
            type: action === 'gg4l' ? 'GG4L' : action === 'g_suite' ? 'G Suite' : 'Standard'
          }
        });
      } else if (action === 'bulk') {
        const BAAD = this.matDialog.open(BulkAddComponent, {
          width: '425px', height: '500px',
          panelClass: 'accounts-profiles-dialog',
          backdropClass: 'custom-bd',
          data: {
            role: !this.currentTab ? '_all' : this.currentTab,
          }
        });
      }
    });

  }

  openPermissions(event) {
    const permissions = this.matDialog.open(PermissionsDialogComponent, {
      width: '425px', height: '500px',
      panelClass: 'accounts-profiles-dialog',
      backdropClass: 'custom-bd',
      data: {
        'users': this.selectedUsers
      }
    });

    permissions.afterClosed().pipe(filter(res => !!res)).subscribe(() => {
      this.selectedUsers = [];
      this.tableService.clearSelectedUsers.next();
    });
  }

  updateTab(route) {
    // if (route) {
      this.router.navigate(['/admin/accounts/', route]);
      this.forceFocus$.next(true);
    // } else {
    //   this.router.navigate(['/admin/accounts']);
    // }
  }

  selectTab(event: HTMLElement, container: HTMLElement) {
    const containerRect = container.getBoundingClientRect();
    const selectedTabRect = event.getBoundingClientRect();
    const tabPointerHalfWidth = (this.tabPointer.nativeElement.getBoundingClientRect().width / 4);
    this.pts = Math.round((selectedTabRect.left - containerRect.left) + tabPointerHalfWidth) - (this.currentTab === '_profile_admin' ? 7 : 0) + 'px';
  }

  setCurrentUnderlinePos(refsArray: QueryList<ElementRef>, buttonsContainer: ElementRef, timeout: number = 200) {
      setTimeout(() => {
        const tabRefsArray = refsArray.toArray();
        const selectedTabRef = this.accountsButtons.findIndex((button) => button.param === this.currentTab);
        if (tabRefsArray[selectedTabRef]) {
          this.selectTab(tabRefsArray[selectedTabRef].nativeElement, buttonsContainer.nativeElement);
        }
      }, timeout);
  }

  openStatusPopup(event) {
    const SPC = this.matDialog.open(StatusPopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': event.currentTarget,
        'profileStatus': true,
        'bulkEdit': true
      }
    });

    SPC.afterClosed()
      .pipe(
        filter(res => !!res),
        switchMap(res => {
          if (res === 'delete') {
            return zip(...this.selectedUsers.map(user => {
              return this.userService.deleteUserRequest(user.id, this.currentTab);
            }));
          } else {
            return zip(...this.selectedUsers.map(user => {
              return this.userService.updateUserRequest(user, {status: res});
            }));
          }
        })
      ).subscribe(res => {
      this.selectedUsers = [];
      this.tableService.clearSelectedUsers.next();
        setTimeout(() => {
          this.adminService.getCountAccountsRequest();
        }, 500);
    });
  }

  search(value) {
    this.adminService.searchAccountEmit$.next(value);
  }

  openIntegrations() {
    const ID = this.matDialog.open(IntegrationsDialogComponent, {
      panelClass: 'overlay-dialog',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '500px',
      data: {'gSuiteOrgs': this.gSuiteOrgs}
    });

    ID.afterClosed()
      .pipe(filter(res => !!res))
      .subscribe(({action, status}) => {
        this.openSettingsDialog(action, status);
      });
  }

  openSettingsDialog(action, status) {
    if (action === 'gg4l') {
      const gg4l = this.matDialog.open(Ggl4SettingsComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-bd',
        width: '425px',
        height: '500px',
        data: { status }
      });
    } else if (action === 'g_suite') {
      const g_suite = this.matDialog.open(GSuiteSettingsComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-bd',
        width: '425px',
        height: '500px',
      });
    }
  }

  promptConfirmation(eventTarget: HTMLElement, option: string = '') {

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

  clearData() {
    this.selectedUsers = [];
    this.tableService.clearSelectedUsers.next();
  }

}