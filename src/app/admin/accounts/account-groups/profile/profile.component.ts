import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DarkThemeSwitch} from '../../../../dark-theme-switch';
import {MatDialog} from '@angular/material/dialog';
import {ProfileCardDialogComponent} from '../../../profile-card-dialog/profile-card-dialog.component';
import {GSuiteSelector, OrgUnit} from '../../../../sp-search/sp-search.component';
import {cloneDeep} from 'lodash';
import {ReplaySubject} from 'rxjs';
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

  @Output() select: EventEmitter<OrgUnit | boolean> = new EventEmitter<OrgUnit | boolean>();

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
    if (this.profile) {
      if (this.profile.selected) {
        this.openInfo = true;
      }
      this.title = this.profile.title;
      this.icon = this.profile.title;
      this.orgUnitCopy = cloneDeep(this.profile);
      this.selector$.next(this.profile.selector);
    }
  }

  ngOnInit() {
    if (this.profile) {
      if (this.profile.selected) {
        this.openInfo = true;
      }
      this.title = this.profile.title;
      this.selector$.subscribe(res => console.log(res));
    }
  }

  selected() {
    if (!this.disabled) {

      if (this.profile) {
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
            this.orgUnitCopy = cloneDeep(this.orgUnitCopy);
            this.select.emit(this.profile);

          });
      } else {
        this.isSelected = !this.isSelected;
        this.select.emit(this.isSelected);
      }


    }
  }

}
