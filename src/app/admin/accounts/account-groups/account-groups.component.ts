import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-account-groups',
  templateUrl: './account-groups.component.html',
  styleUrls: ['./account-groups.component.scss']
})
export class AccountGroupsComponent implements OnInit {

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

}
