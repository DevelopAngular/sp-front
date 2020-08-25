import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {AddRolePopupComponent} from './add-role-popup/add-role-popup.component';

@Component({
  selector: 'app-select-role',
  templateUrl: './select-role.component.html',
  styleUrls: ['./select-role.component.scss']
})
export class SelectRoleComponent implements OnInit {

  @Input() selectedRoles: { role: string, icon: string }[] = [];

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  openAddRole(event) {
    this.dialog.open(AddRolePopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {'trigger': event.currentTarget}
    });
  }

}
