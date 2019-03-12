import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort, MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {

  @Input() width: string = '100%';
  @Input() height: string = 'none';
  @Input() isCheckbox: boolean = true;
  @Input() data: any[];
  @Input() backgroundColor: string = 'transparent';
  @Input() textColor: string = 'black';
  @Input() textHeaderColor: string = '#4b4876';

  @Output() selectedUsers: EventEmitter<any[]> = new EventEmitter();
  @Output() selectedRow: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatSort) sort: MatSort;

  @Input() displayedColumns: string[];
  columnsToDisplay: string[];
  dataSource;
  selection = new SelectionModel<any>(true, []);

  constructor(
  ) {}

  ngOnInit() {
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
              case 'Date & Time':
                  return new Date(item[property]);
              default:
                  return item[property];
          }
      };
      if (!this.displayedColumns) {

        this.displayedColumns = Object.keys(this.data[0]);
      }
      this.columnsToDisplay = this.displayedColumns.slice();
      if (this.isCheckbox) {
          this.columnsToDisplay.unshift('select');
      }
  }

  isAllSelected() {
      const numSelected = this.selection.selected.length;
      const numRows = this.data.length;
      return numSelected === numRows;
  }

  masterToggle() {
      this.isAllSelected() ?
          this.selection.clear() :
          this.data.forEach(row => {
              this.selection.select(row);
          });
  }

  selectedRowEmit(row) {
    this.selectedRow.emit(row);
  }

  pushOutSelected() {
    this.selectedUsers.emit(this.selection.selected);
  }

}

