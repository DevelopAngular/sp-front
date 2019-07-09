import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DarkThemeSwitch} from '../../../dark-theme-switch';
import {GSuiteSelector, OrgUnit, UnitId} from '../../../sp-search/sp-search.component';
import {AdminService} from '../../../services/admin.service';
import * as _ from 'lodash';
import {ReplaySubject} from 'rxjs';


@Component({
  selector: 'app-account-groups',
  templateUrl: './account-groups.component.html',
  styleUrls: ['./account-groups.component.scss']
})
export class AccountGroupsComponent implements OnInit {

  // @Input() orgUnits: any;

  @Output() accountsToSync = new EventEmitter();

  // orgUnits = []
      // { title: 'Admin', icon: 'Admin', path: '/Staff/Admins',  selected: false },
      // { title: 'Teacher', icon: 'Teacher', path: '/Staff/Teachers', selected: false },
      // { title: 'Assistant', icon: 'Secretary', path: '/Staff', selected: false },
      // { title: 'Student', icon: 'Student', path: '/Students', selected: false }
  // ];

  get showButton() {
    // return this.orgUnits.find(item => item.selected);
    return this.orgUnitsEditState;
  }

  public  orgUnits: OrgUnit[] = [];
  public orgUnits$ = new ReplaySubject<OrgUnit[]>(1);
  public  orgUnitsInitialState: OrgUnit[];
  public  orgUnitsEditState: boolean;
  private orgUnitsOldCopy: OrgUnit[];

  constructor(
    public darkTheme: DarkThemeSwitch,
    private adminService: AdminService
  ) { }

  ngOnInit() {
   this.adminService
     .getGSuiteOrgs()
     .subscribe((gSuiteStatus) => {

       console.log(gSuiteStatus);

       if (gSuiteStatus.selectors) {

         const schoolOrgUnits = Object.assign({}, gSuiteStatus.selectors);

         for (const key in schoolOrgUnits) {

           schoolOrgUnits[key].title = key[0].toUpperCase().concat(key.slice(1));
           schoolOrgUnits[key].selected = !!schoolOrgUnits[key].selector.length

           this.orgUnits.push(
             new OrgUnit(
               <UnitId>key,
               schoolOrgUnits[key].title,
               schoolOrgUnits[key].selector.map(s => new GSuiteSelector(s)),
               schoolOrgUnits[key].selected
             )
           );
         }
       }
       this.orgUnitsOldCopy = _.cloneDeep(this.orgUnits);
       this.orgUnits$.next(this.orgUnits);
       console.log(this.orgUnits);
     });

  }

  onSelect(evt: OrgUnit, index: number) {
    this.orgUnits[index] = evt;
    this.orgUnits$.next(this.orgUnits);
    if ( !_.isEqual(this.orgUnitsOldCopy, this.orgUnits) ) {
      this.orgUnitsEditState = true;
    }

  }

  provideSelected() {
    this.accountsToSync.emit(this.orgUnits);
  }
}
