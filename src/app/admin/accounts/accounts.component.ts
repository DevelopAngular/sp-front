import { Component, OnInit } from '@angular/core';
import {AccountsDialogComponent} from '../accounts-dialog/accounts-dialog.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {

  constructor(
    public matDialog: MatDialog,

  ) { }

  ngOnInit() {
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
