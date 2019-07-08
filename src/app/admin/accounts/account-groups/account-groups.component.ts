import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DarkThemeSwitch} from '../../../dark-theme-switch';

@Component({
  selector: 'app-account-groups',
  templateUrl: './account-groups.component.html',
  styleUrls: ['./account-groups.component.scss']
})
export class AccountGroupsComponent implements OnInit, OnChanges {

  @Input() orgUnits: any;

  @Output() accountsToSync = new EventEmitter();

  accounts = [
      // { title: 'Admin', icon: 'Admin', path: '/Staff/Admins',  selected: false },
      // { title: 'Teacher', icon: 'Teacher', path: '/Staff/Teachers', selected: false },
      // { title: 'Assistant', icon: 'Secretary', path: '/Staff', selected: false },
      // { title: 'Student', icon: 'Student', path: '/Students', selected: false }
  ];

  get showButton() {
    return this.accounts.find(item => item.selected);
  }

  constructor(public darkTheme: DarkThemeSwitch) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.orgUnits);
    if (this.orgUnits) {
      for (const key in this.orgUnits) {
        this.accounts.push({
          title: key[0].toUpperCase().concat(key.slice(1)),
          path: (function(ctx) {
            const selectorString = ctx[key].selector.join('');
            return !selectorString || selectorString.search(/\+\//) === 0 ? selectorString.slice(1) : 'Custom selector applied';
          }(this.orgUnits)),
          // disabled: this.orgUnits[key].selector.join('').search(/\+\//) !== 0,
          selected: this.orgUnits[key].selector.length
        });
      }
    }
    console.log(this.accounts);
  }

  provideSelected() {
    this.accountsToSync.emit(this.accounts.filter(acc => acc.selected));
  }
}
