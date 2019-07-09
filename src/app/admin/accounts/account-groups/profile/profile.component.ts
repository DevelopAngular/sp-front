import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DarkThemeSwitch} from '../../../../dark-theme-switch';
import {MatDialog} from '@angular/material';
import {ProfileCardDialogComponent} from '../../../profile-card-dialog/profile-card-dialog.component';
import {GSuiteSelector, OrgUnit} from '../../../../sp-search/sp-search.component';
import * as _ from 'lodash';
import {pipe, ReplaySubject, Subject} from 'rxjs';
import {filter} from 'rxjs/operators';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnChanges {

  @Input() profile: OrgUnit;
  @Input() width: number = 315;
  @Input() plusIcon: boolean = true;
  @Input() disabled: boolean;
  @Input() title: string;
  @Input() infoData: any;
  @Input() isSelected: boolean;
  @Input() icon: string;

  @Output() select: EventEmitter<OrgUnit> = new EventEmitter<OrgUnit>();

  openInfo: boolean;

  mockInfo = [
      { info: 'Class of 2018 (43 accounts)' },
      { info: 'Class of 2019 (67 accounts)' }
  ];

  selector$ = new ReplaySubject<GSuiteSelector[]>(1);

  private orgUnitCopy: OrgUnit;

  constructor(
    private matDialog: MatDialog,
    public darkTheme: DarkThemeSwitch
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.profile.selected) {
      this.openInfo = true;
    }
    if (this.profile) {
      this.orgUnitCopy = _.cloneDeep(this.profile);
      this.selector$.next(this.profile.selector);

    }
  }

  ngOnInit() {
    if (this.profile.selected) {
      this.openInfo = true;
    }
    // this.selector$.next(this.profile.selector);
    this.selector$.subscribe(res => console.log(res));

  }

  selected() {
    if (!this.disabled) {
        // this.openInfo = !this.openInfo;
        // this.select.emit(this.openInfo);
      const dialogRef = this.matDialog.open(ProfileCardDialogComponent, {
        panelClass: 'main-form-dialog-container',
        width: '425px',
        height: '500px',
        data: {
          orgUnit: this.profile,
        }
      });
      dialogRef.afterClosed()
        .pipe(
          filter((res) => res && res.length)
        )
        .subscribe((res: GSuiteSelector[]) => {

          console.log(this.orgUnitCopy.selector, res);

          this.orgUnitCopy.selector.forEach((item: GSuiteSelector) => {
            if (res.findIndex((upItem: GSuiteSelector) => upItem.as === item.as) === -1) {
              item.updateAplicatinIndicator(false);
            }
          });
          res.forEach((upItem: GSuiteSelector) => {
            if (this.orgUnitCopy.selector.findIndex((item: GSuiteSelector) =>  upItem.path === item.path) === -1) {
              this.orgUnitCopy.selector.push(upItem);
            }
          });
          this.orgUnitCopy.selected = !!this.orgUnitCopy.selector.length;

          this.selector$.next(this.orgUnitCopy.selector);
          this.profile = this.orgUnitCopy;
          this.orgUnitCopy = _.cloneDeep(this.orgUnitCopy);
          this.select.emit(this.profile);

        });
    }
  }

}
