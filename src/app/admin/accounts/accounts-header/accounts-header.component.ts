import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, of, Subject, zip} from 'rxjs';
import { TotalAccounts } from '../../../models/TotalAccounts';
import { AdminService } from '../../../services/admin.service';
import { DarkThemeSwitch } from '../../../dark-theme-switch';
import { MatDialog } from '@angular/material';
import { AddUserDialogComponent } from '../../add-user-dialog/add-user-dialog.component';
import { User } from '../../../models/User';
import { UNANIMATED_CONTAINER } from '../../../consent-menu-overlay';
import { ConsentMenuComponent } from '../../../consent-menu/consent-menu.component';
import { mapTo, switchMap, takeUntil, tap } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-accounts-header',
  templateUrl: './accounts-header.component.html',
  styleUrls: ['./accounts-header.component.scss']
})
export class AccountsHeaderComponent implements OnInit, AfterViewInit {

  @Input() pending$: Subject<boolean>;
  @Input() schoolSyncInfoData;
  @Input() selectedUsers: User[];

  @Output() tableStateEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() openTableEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() searchValueEmit: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('tabPointer') tabPointer: ElementRef;
  @ViewChild('navButtonsContainer') navButtonsContainer: ElementRef;
  @ViewChildren('tabRef') tabRefs: QueryList<ElementRef>;

  tableState: boolean;
  openTable: boolean;
  pts;
  currentTab: string;

  destroy$ = new Subject();

  public accounts$: Observable<TotalAccounts> = this.adminService.countAccounts$;

  public accountsButtons = [
    { title: 'Overview', param: '', icon_id: '#Overview' },
    { title: 'Admins', param: '_profile_admin', icon_id: '#Admin', role: 'admin_count' },
    { title: 'Teachers', param: '_profile_teacher', icon_id: '#Teacher', role: 'teacher_count' },
    { title: 'Students', param: '_profile_student', icon_id: '#Student', role: 'student_count' },
    { title: 'Assistants', param: '_profile_assistant', icon_id: '#Assistant', role: 'assistant_count' }
  ];

  constructor(
    private adminService: AdminService,
    public darkTheme: DarkThemeSwitch,
    private matDialog: MatDialog,
    private userService: UserService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getCurrentTab();
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value instanceof NavigationEnd) {
        this.getCurrentTab();
      }
    });
  }

  ngAfterViewInit(): void {
    this.setCurrentUnderlinePos(this.tabRefs, this.navButtonsContainer);
  }

  getCurrentTab() {
    const urlSplit: string[] = this.router.url.split('/');
    this.currentTab = urlSplit[urlSplit.length - 1];
  }

  tableTrigger() {
    this.openTable = !this.openTable;
    this.openTableEmit.emit(this.openTable);
  }

  addUser() {
    const DR = this.matDialog.open(AddUserDialogComponent, {
      width: '425px', height: '500px',
      panelClass: 'accounts-profiles-dialog',
      backdropClass: 'custom-bd',
      data: {
        role: '_all',
        syncInfo: this.schoolSyncInfoData
      }
    });
  }

  updateTab(route) {
    this.router.navigate(['/admin/accounts/', route]);
  }

  selectTab(event: HTMLElement, container: HTMLElement) {
    const containerRect = container.getBoundingClientRect();
    const selectedTabRect = event.getBoundingClientRect();
    const tabPointerHalfWidth = this.tabPointer.nativeElement.getBoundingClientRect().width / 2;
    this.pts = Math.round((selectedTabRect.left - containerRect.left) + tabPointerHalfWidth) + 'px';
  }

  editTableState() {
    this.tableState = !this.tableState;
    this.tableStateEmit.emit(this.tableState);
  }

  setCurrentUnderlinePos(refsArray: QueryList<ElementRef>, buttonsContainer: ElementRef, timeout: number = 50) {
      setTimeout(() => {
        const tabRefsArray = refsArray.toArray();
        const selectedTabRef = this.accountsButtons.findIndex((button) => button.param === this.currentTab);
        if (tabRefsArray[selectedTabRef]) {
          this.selectTab(tabRefsArray[selectedTabRef].nativeElement, buttonsContainer.nativeElement);
        }
      }, timeout);
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

}
