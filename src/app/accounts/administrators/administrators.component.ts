import { Component, OnInit, OnDestroy } from '@angular/core';
import {UserService} from '../../../user.service';
import {Subject} from 'rxjs';
import {takeUntil, map, flatMap} from 'rxjs/operators';
import {User} from '../../../models/User';
import {GSuiteDialogComponent} from '../dialogs/g-suite-dialog/g-suite-dialog.component';
import {} from '';
import {MatDialog} from '@angular/material';
import {AddAccountDialogComponent} from '../dialogs/add-account-dialog/add-account-dialog.component';
import {EditRestrictionsDialogComponent} from '../dialogs/edit-restrictions-dialog/edit-restrictions-dialog.component';
import {RemoveAccountDialogComponent} from '../dialogs/remove-account-dialog/remove-account-dialog.component';

@Component({
  selector: 'app-administrators',
  templateUrl: './administrators.component.html',
  styleUrls: ['./administrators.component.scss']
})
export class AdministratorsComponent implements OnInit, OnDestroy {

  private role: string = '_profile_admin';
  private dialogMap: Map<string, any> = new Map();
  private destroy$: Subject<any> = new Subject();
  public userList: any[] = [];
  public selectedUsers: any[] = [];
  constructor(
    private userService: UserService,
    private matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.dialogMap.set('aad', AddAccountDialogComponent);
    this.dialogMap.set('erd', EditRestrictionsDialogComponent);
    this.dialogMap.set('rad', RemoveAccountDialogComponent);

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
          mode: mode,
        },
        width: '768px', height: '560px',
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd'
      });
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
