import {Component, OnDestroy, OnInit} from '@angular/core';
import {AddAccountDialogComponent} from '../dialogs/add-account-dialog/add-account-dialog.component';
import {Subject} from 'rxjs';
import {EditRestrictionsDialogComponent} from '../dialogs/edit-restrictions-dialog/edit-restrictions-dialog.component';
import {takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material';
import {UserService} from '../../../user.service';
import {RemoveAccountDialogComponent} from '../dialogs/remove-account-dialog/remove-account-dialog.component';
import {AddTeacherProfileDialogComponent} from '../dialogs/add-teacher-profile-dialog/add-teacher-profile-dialog.component';

@Component({
  selector: 'app-subsitutes',
  templateUrl: './subsitutes.component.html',
  styleUrls: ['./subsitutes.component.scss']
})
export class SubsitutesComponent implements OnInit, OnDestroy {

  private _dialogMap: Map<string, any> = new Map();
  private _destroy$: Subject<any> = new Subject();
  public userList: any[] = [];
  public selectedUsers: any[] = [];
  constructor(
    private userService: UserService,
    private matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this._dialogMap.set('atd', AddTeacherProfileDialogComponent);
    this._dialogMap.set('aad', AddAccountDialogComponent);
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
