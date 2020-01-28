import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DarkThemeSwitch} from '../../../dark-theme-switch';
import {GSuiteSelector, OrgUnit, UnitId} from '../../../sp-search/sp-search.component';
import {AdminService} from '../../../services/admin.service';
import { cloneDeep, isEqual } from 'lodash';
import {BehaviorSubject, ReplaySubject} from 'rxjs';
import {switchMap} from 'rxjs/operators';


@Component({
  selector: 'app-account-groups',
  templateUrl: './account-groups.component.html',
  styleUrls: ['./account-groups.component.scss']
})
export class AccountGroupsComponent implements OnInit {

  @Input() syncInside: boolean = false;

  @Output() accountsToSync = new EventEmitter();

  public pending: boolean = false;

  get showButton() {
    return this.orgUnitsEditState;
  }

  public  orgUnits: OrgUnit[] = [];
  public orgUnits$ = new ReplaySubject<OrgUnit[]>(1);
  public  orgUnitsEditState: boolean;
  private orgUnitsOldCopy: OrgUnit[];

  private updater = new BehaviorSubject<any>(null);

  constructor(
    public darkTheme: DarkThemeSwitch,
    private adminService: AdminService
  ) { }

  ngOnInit() {

    this.updater.asObservable()
      .pipe(
        switchMap(() => {
          return this.adminService.getGSuiteOrgs();
        })
      )
     .subscribe((gSuiteStatus) => {
       // console.log(gSuiteStatus);

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
       this.orgUnitsOldCopy = cloneDeep(this.orgUnits);
       this.orgUnits$.next(this.orgUnits);
       // console.log(this.orgUnits);
     });

  }

  onSelect(evt: OrgUnit, index: number) {
    this.orgUnits[index] = evt;
    this.orgUnits$.next(this.orgUnits);
    if ( !isEqual(this.orgUnitsOldCopy, this.orgUnits) ) {
      this.orgUnitsEditState = true;
    }

  }

  provideSelected() {
    if (this.syncInside) {
      this.accountsToSync.emit(this.orgUnits);
    } else {
      const syncBody = {};
      syncBody['is_enabled'] = true;

      this.orgUnits.forEach((item: OrgUnit) => {
        syncBody[`selector_${item.unitId}s`] = item.selector.map((s: GSuiteSelector) => s.as);
      });
      // console.log(syncBody);

      this.pending = true;
      this.adminService.updateSpSyncing(syncBody)
        .pipe(
          switchMap(() => {
            return this.adminService.updateOnboardProgress('setup_accounts:end');
          })
        )
        .subscribe((res) => {
          // console.log(res);
          this.pending = false;
          this.orgUnitsEditState = false;
          this.updater.next(true);
        });


    }
  }
}
