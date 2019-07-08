import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DarkThemeSwitch} from '../../../../dark-theme-switch';
import {MatDialog} from '@angular/material';
import {ProfileCardDialogComponent} from '../../../profile-card-dialog/profile-card-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @Input() title: string;
  @Input() width: number = 315;
  @Input() plusIcon: boolean = true;
  @Input() infoData: any;
  @Input() isSelected: boolean;
  @Input() disabled: boolean;
  @Input() icon: string;

  @Output() select: EventEmitter<boolean> = new EventEmitter<boolean>();

  openInfo: boolean;

  mockInfo = [
      { info: 'Class of 2018 (43 accounts)' },
      { info: 'Class of 2019 (67 accounts)' }
  ];

  constructor(
    private matDialog: MatDialog,
    public darkTheme: DarkThemeSwitch
  ) { }

  ngOnInit() {
    if (this.isSelected) {
      this.openInfo = true;
    }
  }

  selected() {
    if (!this.disabled) {
        // this.openInfo = !this.openInfo;
        // this.select.emit(this.openInfo);
      this.matDialog.open(ProfileCardDialogComponent, {
        data: {
          unit: this.icon
        }
      });
    }
  }

}
