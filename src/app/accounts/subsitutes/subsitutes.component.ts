import {Component, OnDestroy, OnInit} from '@angular/core';
import {AddAccountDialogComponent} from '../dialogs/add-account-dialog/add-account-dialog.component';
import {Subject} from 'rxjs';
import {EditRestrictionsDialogComponent} from '../dialogs/edit-restrictions-dialog/edit-restrictions-dialog.component';
import {takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material';
import {UserService} from '../../../user.service';
import {RemoveAccountDialogComponent} from '../dialogs/remove-account-dialog/remove-account-dialog.component';
import {AddTeacherProfileDialogComponent} from '../dialogs/add-teacher-profile-dialog/add-teacher-profile-dialog.component';
import {debounceTime} from 'rxjs/internal/operators';

@Component({
  selector: 'app-subsitutes',
  templateUrl: './subsitutes.component.html',
  styleUrls: ['./subsitutes.component.scss']
})
export class SubsitutesComponent implements OnInit, OnDestroy {
  private role: string = 'staff_secretary';
  private dialogMap: Map<string, any> = new Map();
  private destroy$: Subject<any> = new Subject();
  public userList: any[] = [];
  public selectedUsers: any[] = [];
  constructor(
    private userService: UserService,
    private matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.dialogMap.set('atd', AddTeacherProfileDialogComponent);
    this.dialogMap.set('aad', AddAccountDialogComponent);
    this.dialogMap.set('erd', EditRestrictionsDialogComponent);
    this.dialogMap.set('rad', RemoveAccountDialogComponent);

    this.getUserList();

  }
  showSerarchParam(e) {
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
      .pipe(takeUntil(this.destroy$), debounceTime(500))
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
