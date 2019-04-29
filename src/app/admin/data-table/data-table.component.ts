import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort, MatTableDataSource} from '@angular/material';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {

  @Input() width: string = '100%';
  @Input() height: string = 'none';
  @Input() isCheckbox: boolean = true;
  @Input() set data(value: any[]) {
      this._data = [...value];
      this.dataSource = new MatTableDataSource(this._data);
  }
  @Input() disallowHover: boolean = false;
  @Input() backgroundColor: string = 'transparent';
  @Input() textColor: string = 'black';
  @Input() textHeaderColor: string = '#1F195E';

  @Output() selectedUsers: EventEmitter<any[]> = new EventEmitter();
  @Output() selectedRow: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedCell: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatSort) sort: MatSort;

  @Input() displayedColumns: string[];
  columnsToDisplay: string[];
  dataSource: MatTableDataSource<any[]>;
  selection = new SelectionModel<any>(true, []);

  hovered: boolean;
  hoveredRowIndex: number;
  pressed: boolean;


  private _data: any[] = [];

  constructor(
    public darkTheme: DarkThemeSwitch,
    private sanitizer: DomSanitizer,

  ) {}
  // get cursor(){
  //   return this.valid?'pointer':'not-allowed';
  // }


  // get textColor() {
  //
  //     if (this.hovered) {
  //       return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
  //     } else {
  //       return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
  //     }
  // }

  ngOnInit() {
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'Name':
              return item[property].split(' ')[1];
            case 'Date & Time':
                return new Date(item[property]);
            default:
                return item[property];
          }
      };
      if (!this.displayedColumns) {
        this.displayedColumns = Object.keys(this._data[0]);
      }
      this.columnsToDisplay = this.displayedColumns.slice();
      if (this.isCheckbox) {
          this.columnsToDisplay.unshift('select');
      }
  }

  onHover(target: HTMLElement) {

    this.hovered = true;
    target.style.backgroundColor = this.getBgColor();
    target.style.color = this.getCellColor();
  }
  onLeave(target: HTMLElement) {

    this.hovered = false;
    target.style.color = this.getCellColor();
    target.style.backgroundColor = 'transparent';
  }
  onDown(target: HTMLElement) {

    this.pressed = true;
    target.style.backgroundColor = this.getBgColor();
  }

  onUp(target: HTMLElement) {

    this.pressed = false;
    target.style.backgroundColor = this.getBgColor();
  }


  getBgColor(n?) {
    if (n === this.hoveredRowIndex && !this.disallowHover) {
      if (this.hovered) {
        if (this.pressed) {
          return this.darkTheme.isEnabled$.value ? '#09A4F7' : '#E2E7F4';
        } else {
          return this.darkTheme.isEnabled$.value ? '#0991c3' : '#ECF1FF';
        }
      } else {
        return 'transparent';
      }
    }
  }

  getCellColor(n?) {
    if (n === this.hoveredRowIndex && !this.disallowHover) {
      if (this.hovered) {
        return this.darkTheme.isEnabled$.value ? '#FFFFFF' : this.textColor;
      } else {
        return this.darkTheme.getColor({white: this.textColor, dark: '#767676'});
      }

    } else {
      return this.darkTheme.getColor({white: this.textColor, dark: '#767676'});
    }
  }


  isAllSelected() {
      const numSelected = this.selection.selected.length;
      const numRows = this._data.length;
      return numSelected === numRows;
  }

  masterToggle() {
      this.isAllSelected() ?
          this.selection.clear() :
          this._data.forEach(row => {
              this.selection.select(row);
          });
  }

  normalizeCell(cellData) {
    if (!cellData) {
      return new Array(0);
    }
    if (Array.isArray(cellData)) {
      return cellData;
    } else {
      return  new Array(cellData);
    }
  }
  displayCell(cellElement) {
    if (typeof cellElement === 'string') {
      return cellElement;
    } else {
      return cellElement.title ? cellElement.title : 'Error!';
    }
  }

  selectedCellEmit(event, cellElement, element) {
    // console.log(element);
    if (typeof cellElement !== 'string' && !(cellElement instanceof Location)) {
      event.stopPropagation();
      cellElement.row = element;
      this.selectedCell.emit(cellElement);
    } else {
      return;
    }
  }

  selectedRowEmit(row) {
    this.selectedRow.emit(row);
  }

  pushOutSelected() {
    this.selectedUsers.emit(this.selection.selected);
  }

  clearSelection() {
    this.selection.clear();
  }

}

