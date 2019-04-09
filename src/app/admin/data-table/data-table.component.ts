import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort, MatTableDataSource} from '@angular/material';
import {DarkThemeSwitch} from '../../dark-theme-switch';

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

  private _data: any[] = [];

  constructor(
    public darkTheme: DarkThemeSwitch
  ) {}

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

