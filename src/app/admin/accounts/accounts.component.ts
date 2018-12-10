import { Component, OnInit } from '@angular/core';
import {AccountsDialogComponent} from '../accounts-dialog/accounts-dialog.component';
import {MatDialog} from '@angular/material';
import {HttpService} from '../../http-service';
import {User} from '../../models/User';
import {UserService} from '../../user.service';
import {BehaviorSubject, ReplaySubject, Subject} from 'rxjs';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {

  public accounts$ =
    new BehaviorSubject<any>({
      total: 0,
      admin_count: 0,
      student_count: 0,
      teacher_count: 0
    });

  constructor(
    public matDialog: MatDialog,
    private userService: UserService,
    private http: HttpService
  ) { }

  ngOnInit() {

    this.http.get('v1/admin/accounts').subscribe((u_list: any) => {
      console.log(u_list, Object.values(u_list));
      u_list.total = Object.values(u_list).reduce((a: number, b: number) => a + b);
      console.log(u_list);
      this.accounts$.next(u_list);
    });
  }

  openDialog(mode) {
    const DR = this.matDialog.open(AccountsDialogComponent,
      {
        data: {
          mode: mode
        },
        width: '768px', height: '560px',
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd'
      });
  }
}
