import { Component, OnInit } from '@angular/core';
import {AccountsDialogComponent} from '../accounts-dialog/accounts-dialog.component';
import {MatDialog} from '@angular/material';
import {HttpService} from '../../http-service';
import {User} from '../../models/User';
import {UserService} from '../../user.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {

  public accounts: any = {
   'total': [],
   '_profile_admin': 0,
   '_profile_teacher': 0,
   '_profile_student': 0,
   'staff_secretary': 0
  };

  constructor(
    public matDialog: MatDialog,
    private userService: UserService
  ) { }

  ngOnInit() {

    this.userService.getUsersList().subscribe((u_list: User[]) => {
        this.accounts['total'] = u_list;
        const compareRoles = ['_profile_admin', '_profile_teacher', '_profile_student', 'staff_secretary'];

        u_list.forEach((user) => {

            compareRoles.forEach((role) => {
              if (user.roles.includes(role)) {
                this.accounts[role]++;
              }
            });

            // switch(account.roles) {
            //   case('_profile_admin'): {
            //
            //     break;
            //   }
            //   case('_profile_student'): {
            //
            //     break;
            //   }
            //   case('_profile_teacher'): {
            //
            //     break;
            //   }
            //   case('staff_secretary'): {
            //
            //     break;
            //   }
            // }
        });
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
