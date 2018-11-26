import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AddAccountDialogComponent} from '../dialogs/add-account-dialog/add-account-dialog.component';
import {Subject} from 'rxjs';
import {EditRestrictionsDialogComponent} from '../dialogs/edit-restrictions-dialog/edit-restrictions-dialog.component';
import {takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material';
import {UserService} from '../../../user.service';
import {RemoveAccountDialogComponent} from '../dialogs/remove-account-dialog/remove-account-dialog.component';
import {AddRoomsDialogComponent} from '../dialogs/add-rooms-dialog/add-rooms-dialog.component';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss']
})
export class TeachersComponent implements OnInit, OnDestroy {
  @Input() role: string = '_profile_teacher';
  // private role: string = '_profile_teacher';
  // private dialogMap: Map<string, any> = new Map();
  private destroy$: Subject<any> = new Subject();
  public userList: any[] = [];
  public selectedUsers: any[] = [];
  constructor(
    private userService: UserService,
    private matDialog: MatDialog,
  ) { }

  ngOnInit() {
    // this.dialogMap.set('aad', AddAccountDialogComponent);
    // this.dialogMap.set('ard', AddRoomsDialogComponent);
    // this.dialogMap.set('erd', EditRestrictionsDialogComponent);
    // this.dialogMap.set('rad', RemoveAccountDialogComponent);

    this.getUserList();

  }
  showSearchParam(e) {
    console.log(e);
    this.getUserList(e);
  }
  showSelected(e) {
    console.log(e);
    this.selectedUsers = e;
  }
  openDialog(mode) {

    const DR = this.matDialog.open(EditRestrictionsDialogComponent,
      {
        data: {
          selectedUsers: this.selectedUsers,
          mode: mode,
          restrictions: {
            'dashboard_access': false,
            'hall_monitor_access': true,
            'search_access': false,
            'pass_config_access': false,
            'accounts_access': false,
            'school_setting_access': true,
          }
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
    this.userService
      .getUsersList(this.role, query)
      .pipe(takeUntil(this.destroy$))
      .subscribe((userList) => {
        this.userList = userList.map((raw) => {
          return {
            'Name': raw.display_name,
            'Account Email': raw.primary_email,
            'Last Sign-in': raw.last_updated,
            'Restrictions': 'None'
          };
        });
      });
  }
}
