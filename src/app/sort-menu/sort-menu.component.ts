import {ChangeDetectionStrategy, Component, EventEmitter, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material';
import {DarkThemeSwitch} from '../dark-theme-switch';

@Component({
  selector: 'app-sort-menu',
  templateUrl: './sort-menu.component.html',
  styleUrls: ['./sort-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortMenuComponent implements OnInit, OnDestroy {

  items: any[];
  selectedItem: any;

  onListItemClick = new EventEmitter();

  showAllRooms: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SortMenuComponent>,
    public darkTheme: DarkThemeSwitch,
  ) {}

  ngOnInit() {
    this.items = this.data['items'];
    this.selectedItem = this.data['selectedItem'];
    this.showAllRooms = this.data['showAll'];
  }

  ngOnDestroy(): void {
  }

  selectSortOption(location): void {
    this.selectedItem = location;
    this.onListItemClick.emit(location);
  }
}
