import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DarkThemeSwitch} from '../dark-theme-switch';

@Component({
  selector: 'app-sort-menu',
  templateUrl: './sort-menu.component.html',
  styleUrls: ['./sort-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortMenuComponent implements OnInit {

  @ViewChild('_item') item: ElementRef;

  items: any[];
  selectedItem: any;

  onListItemClick = new EventEmitter();

  showAllRooms: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SortMenuComponent>,
    public darkTheme: DarkThemeSwitch
  ) {}

  ngOnInit() {
    this.items = this.data['items'];
    this.selectedItem = this.data['selectedItem'];
    this.showAllRooms = this.data['showAll'];
  }

  selectSortOption(location): void {
    this.selectedItem = location;
    this.onListItemClick.emit(location);
  }
}
