import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

export interface CustomTableColumns {
  [id: number]: {
    sortBy: string;
    title: string;
    field: string;
  };
}

@Component({
  selector: 'app-custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTableComponent implements OnInit {

  @Input() displayedColumns: CustomTableColumns;
  @Input() data;

  constructor() { }

  ngOnInit() {
  }

  disableSortColumns() {
    return 0;
  }

  columnClick(key) {
    debugger
  }

}
