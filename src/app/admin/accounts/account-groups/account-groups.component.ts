import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-account-groups',
  templateUrl: './account-groups.component.html',
  styleUrls: ['./account-groups.component.scss']
})
export class AccountGroupsComponent implements OnInit {

  @Output() accountsToSync = new EventEmitter();

  accounts = [
      { title: 'Admins', selected: false },
      { title: 'Teachers', selected: false },
      { title: 'Assistants', selected: false },
      { title: 'Students', selected: false }
  ];

  get showButton() {
    return this.accounts.find(item => item.selected);
  }

  constructor() { }

  ngOnInit() {
  }
  provideSelected() {
    this.accountsToSync.emit(this.accounts.filter(acc => acc.selected));
  }
}
