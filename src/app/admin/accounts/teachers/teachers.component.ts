import {Component, OnDestroy, OnInit} from '@angular/core';
import {AddAccountDialogComponent} from '../dialogs/add-account-dialog/add-account-dialog.component';
import {Subject} from 'rxjs';
import {EditRestrictionsDialogComponent} from '../dialogs/edit-restrictions-dialog/edit-restrictions-dialog.component';
import {takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material';
import {UserService} from '../../../user.service';
import {RemoveAccountDialogComponent} from '../dialogs/remove-account-dialog/remove-account-dialog.component';
import {AddRoomsDialogComponent} from '../dialogs/add-rooms-dialog/add-rooms-dialog.component';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss']
})
export class TeachersComponent implements OnInit, OnDestroy {
  private _dialogMap: Map<string, any> = new Map();
  private _destroy$: Subject<any> = new Subject();
  public userList: any[] = [];
  public selectedUsers: any[] = [];
  constructor(
    private userService: UserService,
    private matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this._dialogMap.set('aad', AddAccountDialogComponent);
    this._dialogMap.set('ard', AddRoomsDialogComponent);
    this._dialogMap.set('erd', EditRestrictionsDialogComponent);
    this._dialogMap.set('rad', RemoveAccountDialogComponent);

    this.userService
      .getUsersList()
      .pipe(takeUntil(this._destroy$))
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
  showSerarchParam(e) {
    console.log(e);
  }
  showSelected(e) {
    console.log(e);
    this.selectedUsers = e;
  }
  openDialog(target) {
    const DR = this.matDialog.open(this._dialogMap.get(target),
      {
        width: '768px', height: '560px',
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd'
      });
  }
  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
