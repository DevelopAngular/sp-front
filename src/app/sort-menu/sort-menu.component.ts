import {Component, EventEmitter, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {SortByItem} from '../models/SortByItem';
import {MAT_DIALOG_DATA} from '@angular/material';
import {DarkThemeSwitch} from '../dark-theme-switch';

@Component({
  selector: 'app-sort-menu',
  templateUrl: './sort-menu.component.html',
  styleUrls: ['./sort-menu.component.scss'],
})
export class SortMenuComponent implements OnInit, OnDestroy {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string,
      list: Array<SortByItem>
    },
    public dialogRef: MatDialogRef<SortMenuComponent>,
    public darkTheme: DarkThemeSwitch,
  ) {}

  onListItemClick = new EventEmitter();

  isSelected: boolean;

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

  selectSortOption(index): void {
    this.data.list.forEach( (sortByItem, i) => {
      sortByItem.isSelected = i === index;
    });
    this.onListItemClick.emit(index);
  }
}
