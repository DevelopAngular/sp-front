import {Component, OnDestroy, OnInit} from '@angular/core';
import {AddAccountDialogComponent} from '../dialogs/add-account-dialog/add-account-dialog.component';
import {interval, Observable, of, Subject, Subscription} from 'rxjs';
import {EditRestrictionsDialogComponent} from '../dialogs/edit-restrictions-dialog/edit-restrictions-dialog.component';
import {takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material';
import {UserService} from '../../../user.service';
import {RemoveAccountDialogComponent} from '../dialogs/remove-account-dialog/remove-account-dialog.component';
import {debounce, debounceTime, distinctUntilChanged, switchMap, take} from 'rxjs/internal/operators';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit, OnDestroy {
  private role: string = 'hallpass_student';

  private dialogMap: Map<string, any> = new Map();
  private destroy$: Subject<any> = new Subject();
  private searchChangeObserver$: Subject<string>;
  public userList: any[] = [];
  public selectedUsers: any[] = [];
  public placeholder: boolean;

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

  showSearchParam(searchValue) {
    console.log(searchValue);
    // const _e$ = new Subject<string>();
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
