import { Component, OnInit } from '@angular/core';
import { AccountsDialogComponent } from '../accounts-dialog/accounts-dialog.component';
import { MatDialog } from '@angular/material';
import { HttpService } from '../../services/http-service';
import { UserService } from '../../services/user.service';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/internal/operators';
import { AdminService } from '../../services/admin.service';

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
    private http: HttpService,
    private adminService: AdminService
  ) { }

  ngOnInit() {

    this.http.globalReload$.pipe(
      switchMap(() => this.adminService.getAdminAccounts())
    )
    .subscribe((u_list: any) => {
      console.log(u_list, Object.values(u_list));
      if (u_list.total_count !== undefined) {
        u_list.total = u_list.total_count;
      } else {
        u_list.total = Object.values(u_list).reduce((a: number, b: number) => a + b);
      }
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
