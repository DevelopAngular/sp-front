import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input, NgZone, OnChanges, OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {DataSource, SelectionModel} from '@angular/cdk/collections';
import {MatSort, Sort} from '@angular/material';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {BehaviorSubject, Observable} from 'rxjs';
import {SP_ARROW_BLUE_GRAY, SP_ARROW_DOUBLE_BLUE_GRAY} from '../pdf-generator.service';
import {CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import * as moment from 'moment';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {ScrollPositionService} from '../../scroll-position.service';
import {wrapToHtml} from '../helpers';

const PAGESIZE = 50;
const ROW_HEIGHT = 38;

// export class tableSanitizer extends DomSanitizer {
//   constructor() {
//     super()
//   }
// }

export class GridTableDataSource extends DataSource<any> {

  public  stickySpace: boolean;
  public _fixedColumnsPlaceholder: any = {
    placeholder: true
  };

  private _data: any[];

  get allData(): any[] {
    return this._data.slice();
  }

  set allData(data: any[]) {
    this._data = data;
    this.viewport.scrollToOffset(0);
    this.viewport.setTotalContentSize(this.itemSize * data.length);
    this.visibleData.next(this._data.slice(0, PAGESIZE).concat(this._fixedColumnsPlaceholder));
  }

  sort: MatSort | null;

  offset = 0;
  offsetChange = new BehaviorSubject(0);

  constructor(
    initialData: any[],
    private viewport: CdkVirtualScrollViewport,
    private itemSize: number, sorting: MatSort,
    stickySpace: boolean, private domSanitizer: DomSanitizer
  ) {
    super();

    this.domSanitizer = domSanitizer;

    this._data = initialData;
    this.sort = sorting;
    this.stickySpace = stickySpace;

    this._data.forEach((item, index) => {
      for (const key in item._data) {
        if (!this._fixedColumnsPlaceholder[key] || item._data[key].length > this._fixedColumnsPlaceholder[key].length) {
          this._fixedColumnsPlaceholder[key] = item._data[key];
        }
      }
    });

    for (const key in this._fixedColumnsPlaceholder) {
      if (key === 'TT') {
        this._fixedColumnsPlaceholder[key] = this.domSanitizer.bypassSecurityTrustHtml(this._fixedColumnsPlaceholder[key]);

      } else if (key === 'Group(s)') {
        console.log(this._fixedColumnsPlaceholder[key]);
        this._fixedColumnsPlaceholder[key] = '. ' + this._fixedColumnsPlaceholder[key].map(g => g.title).join(this._fixedColumnsPlaceholder[key].length > 1 ? ', ' : '') + ' .';
      }  else if (key === 'Rooms') {
        console.log(this._fixedColumnsPlaceholder[key]);
        this._fixedColumnsPlaceholder[key] = '. ' + this._fixedColumnsPlaceholder[key].join(this._fixedColumnsPlaceholder[key].length > 1 ? ', ' : '') + ' .';
      } else {
        this._fixedColumnsPlaceholder[key] = '. ' + this._fixedColumnsPlaceholder[key] + ' .';
      }


    }

    this._fixedColumnsPlaceholder = wrapToHtml.call(this, this._fixedColumnsPlaceholder, 'span') as {[key: string]: SafeHtml; _data: any};


    console.log(this._fixedColumnsPlaceholder);

    this.viewport.elementScrolled().subscribe((ev: any) => {

      const start = Math.floor((ev.currentTarget.scrollTop >= 0 ? ev.currentTarget.scrollTop : 0) / ROW_HEIGHT);
      const prevExtraData = start > 0 && start <= 12 && this.stickySpace ? 1 : start > 12 ? 12 : 0;
      const slicedData = this._data.slice(start - prevExtraData, start + (PAGESIZE - prevExtraData)).concat(this._fixedColumnsPlaceholder);

      this.offset = ROW_HEIGHT * (start - prevExtraData);
      this.viewport.setRenderedContentOffset(this.offset);
      this.offsetChange.next(this.offset);
      this.visibleData.next(slicedData);
      // console.log(this.offset);
    });
  }

  private readonly visibleData: BehaviorSubject<any[]> = new BehaviorSubject([]);


  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortingDataAccessor(item, property) {
    switch (property) {
      case 'Name':
        return item[property].split(' ')[1];
      case 'Date & Time':
        return Math.min(moment().diff(item['date'], 'days'));
      case 'Duration':
        return item['sortDuration'].as('milliseconds');
      case 'Profile(s)':
        return item[property].map(i => i.title).join('');
      default:
        return item[property];
    }
  }

  connect(collectionViewer: import('@angular/cdk/collections').CollectionViewer): Observable<any[] | ReadonlyArray<any>> {
    return this.visibleData;
  }

  disconnect(collectionViewer: import('@angular/cdk/collections').CollectionViewer): void {
  }
}

/**
 * Virtual Scroll Strategy
 */
export class CustomVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  constructor() {
    super(ROW_HEIGHT, 1000, 2000);
  }

  attach(viewport: CdkVirtualScrollViewport): void {
    this.onDataLengthChanged();
  }
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: VIRTUAL_SCROLL_STRATEGY, useClass: CustomVirtualScrollStrategy}],

})
export class DataTableComponent implements OnInit, OnChanges, OnDestroy {

  @Input() width: string = '100%';
  @Input() height: string = 'none';
  @Input() isCheckbox: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  @Input() isAllowedSelectRow: boolean = false;

  @Input() stickySpace: boolean = false;
  @Input() disallowHover: boolean = false;
  @Input() backgroundColor: string = 'transparent';
  @Input() textColor: string = 'black';
  @Input() textHeaderColor: string = '#7F879D';
  @Input() marginTopStickyHeader: string = '-40px';
  @Input() displayedColumns: string[];
  @Input() scrollableAreaName: string;

  @Output() selectedUsers: EventEmitter<any[]> = new EventEmitter();
  @Output() selectedRow: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedCell: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;


  @Input() set data(value: any[]) {
    this._data = [...value];
    this.dataSource = new GridTableDataSource(this._data, this.viewport, ROW_HEIGHT, this.sort, this.stickySpace, this.domSanitizer);
    this.dataSource.offsetChange
      .subscribe(offset => {
        this.placeholderHeight = offset;
    })
    this.dataSource.allData = this._data;
    this.dataSource.sort.sortChange.subscribe((sort: Sort) => {
      const data = this.dataSource.allData;
      if (!sort.active || sort.direction === '') {
        this.dataSource.allData = data;
        return;
      }

      this.dataSource.allData = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        const {_data: _a} = a;
        const {_data: _b} = b;

        return this.dataSource.compare(
          this.dataSource.sortingDataAccessor(_a, sort.active),
          this.dataSource.sortingDataAccessor(_b, sort.active),
          isAsc
        );

      });
    });
  }

  itemSize = ROW_HEIGHT;
  columnsToDisplay: string[];
  dataSource: GridTableDataSource;
  selection = new SelectionModel<any>(true, []);
  darkMode$: Observable<boolean>;
  placeholderHeight = 0;

  private _data: any[] = [];

  constructor(
    private _ngZone: NgZone,
    private darkTheme: DarkThemeSwitch,
    private domSanitizer: DomSanitizer,
    private scrollPosition: ScrollPositionService
  ) {
    this.darkMode$ = this.darkTheme.isEnabled$.asObservable();
  }

  ngOnInit() {
    // console.log(this._data);

    this.marginTopStickyHeader = '0px';
    if (!this.displayedColumns) {
      this.displayedColumns = Object.keys(this._data[0]);
    }
    this.columnsToDisplay = this.displayedColumns.slice();
    this.isCheckbox.subscribe((v) => {
      if (v) {
        this.columnsToDisplay.unshift('select');
      } else if (!v && (this.columnsToDisplay[0] === 'select')) {
        this.columnsToDisplay.shift();
        this.selection.clear();
        this.selectedUsers.emit([]);
      }
    });

  }

  ngOnChanges() {
    if (this.scrollableAreaName && this.scrollPosition.getComponentScroll(this.scrollableAreaName)) {
      setTimeout(() => {
        // console.log(this.scrollPosition.getComponentScroll(this.scrollableAreaName));
        this.viewport.scrollToOffset(this.scrollPosition.getComponentScroll(this.scrollableAreaName));
      }, 0);
    }
  }

  ngOnDestroy(): void {
    if (this.scrollableAreaName) {
      this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.placeholderHeight);
    }
  }

  placeholderWhen(index: number, _: any) {
    return index === 0;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this._data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected() )  {
      this.selection.clear();
      this._data.forEach(row => {
        row.pressed = false;
      });
    } else {
      this._data.forEach(row => {
        this.selection.select(row._data);
        row.pressed = true;
      });
    }
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

  displayCell(cellElement, cell?, column?) {
    let value = '';
    if (typeof cellElement === 'string') {
      if (column === 'TT') {
        if (cellElement === 'one_way') {
          value = SP_ARROW_BLUE_GRAY;
        }
        if (cellElement === 'round_trip' || cellElement === 'both') {
          value = SP_ARROW_DOUBLE_BLUE_GRAY;
        }
        cell.innerHTML = value;
          return;
      } else {
          value = cellElement;
      }
    } else {
      value = cellElement.title ? cellElement.title : 'Error!';
    }
    return value;
  }

  selectedCellEmit(event, cellElement, element) {
    // debugger
    if (typeof cellElement !== 'string' && cellElement.title !== 'No profile' && !(cellElement instanceof Location) && !this.isCheckbox.value) {
      event.stopPropagation();
      cellElement.row = element;
      this.selectedCell.emit(cellElement);
    } else {
      return;
    }
  }

  selectedRowEmit(evt, row) {
    console.log(row)
    // debugger
    const rowData = row._data;
    const target = evt.target as HTMLElement;
    if (this.isCheckbox.value && !this.isAllowedSelectRow) {
      this.selection.toggle(rowData);
      row.pressed = this.selection.isSelected(rowData);
      this.pushOutSelected();
    } else if (target.dataset && target.dataset.profile) {

      this.selectedCell.emit({
        name: target.dataset.name,
        role: target.dataset.profile
      });
    } else {
      this.selectedRow.emit(rowData);
    }
  }

  pushOutSelected() {
    this.selectedUsers.emit(this.selection.selected);
  }

  clearSelection() {
    this.selection.clear();
  }

}

