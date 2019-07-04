import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DarkThemeSwitch} from '../../../dark-theme-switch';

@Component({
  selector: 'app-account-groups',
  templateUrl: './account-groups.component.html',
  styleUrls: ['./account-groups.component.scss']
})
export class AccountGroupsComponent implements OnInit {

  @Output() accountsToSync = new EventEmitter();

  accounts = [
      { title: 'Admins', icon: 'Admin', selected: false },
      { title: 'Teachers', icon: 'Teacher', selected: false },
      { title: 'Assistants', icon: 'Secretary', selected: false },
      { title: 'Students', icon: 'Student', selected: false }
  ];

  get showButton() {
    return this.accounts.find(item => item.selected);
  }

  constructor(public darkTheme: DarkThemeSwitch) { }

  ngOnInit() {
  }
  provideSelected() {
    this.accountsToSync.emit(this.accounts.filter(acc => acc.selected));
  }
}
