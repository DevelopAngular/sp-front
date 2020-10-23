import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material';
import {AddRolePopupComponent} from './add-role-popup/add-role-popup.component';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-select-role',
  templateUrl: './select-role.component.html',
  styleUrls: ['./select-role.component.scss']
})
export class SelectRoleComponent implements OnInit {

  @Input() selectedRoles: {id: number, role: string, icon: string, description: string}[] = [];
  @Input() isAccessAdd: boolean = true;
  @Input() invalid: boolean;

  @Output() onSelect: EventEmitter<{id: number, role: string, icon: string, description: string}[]> = new EventEmitter<{id: number, role: string, icon: string, description: string}[]>();

  roles = [
    {id: 1, role: 'Student', icon: './assets/Student (Blue-Gray).svg', description: 'Students can create passes, schedule passes for the future, and send pass requests to teachers.'},
    {id: 2, role: 'Teacher', icon: './assets/Teacher (Blue-Gray).svg', description: 'Teachers can manage passes in his/her room, see hallway activity, create passes, and more.'},
    {id: 3, role: 'Admin', icon: './assets/Admin (Blue-Gray).svg', description: 'Admins can explore pass history, reports, manage rooms, set-up accounts, and more.'},
    {id: 4, role: 'Assistant', icon: './assets/Assistant (Blue-Gray).svg', description: 'Assistants can act on behalf of other teachers: manage passes, create passes, and more.'}
  ];

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    this.onSelect.emit(this.selectedRoles);
  }

  deleteRole(role) {
    this.selectedRoles = this.selectedRoles.filter(r => r.role !== role.role);
    this.onSelect.emit(this.selectedRoles);
  }

  openAddRole(event) {
    const ADDR = this.dialog.open(AddRolePopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {'trigger': event.currentTarget, options: this.roles, selectedRoles: this.selectedRoles}
    });

    ADDR.afterClosed().pipe(filter(res => !!res)).subscribe(option => {
      if (option.role === 'Student' || this.selectedRoles.find(role => role.role === 'Student')) {
        this.selectedRoles = [option];
      } else {
        this.selectedRoles.push(option);
      }
      this.onSelect.emit(this.selectedRoles);
    });
  }

}
