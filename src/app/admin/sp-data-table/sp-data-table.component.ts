import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {DataSource, SelectionModel} from '@angular/cdk/collections';
import {BehaviorSubject, Observable} from 'rxjs';
import {CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {MatSort, Sort} from '@angular/material';
import * as moment from 'moment';
import {StorageService} from '../../services/storage.service';

const PAGESIZE = 50;
const ROW_HEIGHT = 33;

export class GridTableDataSource extends DataSource<any> {
  private _data: any[];

  get allData(): any[] {
    return this._data.slice();
  }

  set allData(data: any[]) {
    this._data = data;
    this.viewport.scrollToOffset(0);
    this.viewport.setTotalContentSize(this.itemSize * data.length);
    this.visibleData.next(this._data.slice(0, PAGESIZE));
  }

  sort: MatSort | null;
  offset = 0;
  offsetChange = new BehaviorSubject(0);

  constructor(
    private initialData$: Observable<any[]>,
    private viewport: CdkVirtualScrollViewport,
    private itemSize: number
  ) {
    super();
    this.initialData$
      .subscribe(res => {
        this.allData = res;
      });

    this.viewport.elementScrolled().subscribe((ev: any) => {
      const start = Math.floor(ev.currentTarget.scrollTop / ROW_HEIGHT);
      const prevExtraData = start > 5 ? 5 : 0;
      const slicedData = this._data.slice(start - prevExtraData, start + (PAGESIZE - prevExtraData));
      this.offset = ROW_HEIGHT * (start - prevExtraData);
      this.viewport.setRenderedContentOffset(this.offset);
      this.offsetChange.next(this.offset);
      this.visibleData.next(slicedData);
    });
  }

  private readonly visibleData: BehaviorSubject<any[]> = new BehaviorSubject([]);

  connect(collectionViewer: import('@angular/cdk/collections').CollectionViewer): Observable<any[] | ReadonlyArray<any>> {
    return this.visibleData.asObservable();
  }

  disconnect(collectionViewer: import('@angular/cdk/collections').CollectionViewer): void {
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortingDataAccessor(item, property) {
    switch (property) {
      case 'Name':
        return item[property].split(' ')[1];
      case 'Pass start time':
        return moment(item['date']).milliseconds;
      case 'Duration':
        return item['sortDuration'].as('milliseconds');
      case 'Profile(s)':
        return item[property].map(i => i.title).join('');
      case 'Last sign-in':
        if (item['last_sign_in']) {
          return moment(item['last_sign_in']).toDate();
        } else {
          return new Date('1995-12-17T03:24:00');
        }
      default:
        return item[property];
    }
  }
}

export class CustomVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  constructor() {
    super(ROW_HEIGHT, 1000, 2000);
  }

  attach(viewport: CdkVirtualScrollViewport): void {
    this.onDataLengthChanged();
  }
}

@Component({
  selector: 'app-sp-data-table',
  templateUrl: './sp-data-table.component.html',
  styleUrls: ['./sp-data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: VIRTUAL_SCROLL_STRATEGY, useClass: CustomVirtualScrollStrategy}]
})
export class SpDataTableComponent implements OnInit, AfterViewInit {

  @Input() isCheckbox: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  @Input() data$: Observable<any>;

  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
  @ViewChild(MatSort) sort: MatSort;

  placeholderHeight = 0;
  displayedColumns: string[];
  columnsToDisplay: string[];
  dataSource: GridTableDataSource;
  selection = new SelectionModel<any>(true, []);
  itemSize = 33;
  currentSort: {active: string, direction: string} = {active: '', direction: ''};

  constructor(
    private cdr: ChangeDetectorRef,
    private storage: StorageService
  ) {}

  ngAfterViewInit() {

  }

  ngOnInit() {
    this.dataSource = new GridTableDataSource(this.data$, this.viewport, this.itemSize);
    this.dataSource.sort = this.sort;
    this.dataSource.offsetChange.subscribe(offset => {
      this.placeholderHeight = offset;
    });
    this.displayedColumns = Object.keys(this.dataSource.allData[0]);
    this.columnsToDisplay = this.displayedColumns.slice();
    this.isCheckbox.subscribe((v) => {
      if (v) {
        this.columnsToDisplay.unshift('select');
      } else if (!v && (this.columnsToDisplay[0] === 'select')) {
        this.columnsToDisplay.shift();
        this.selection.clear();
      }
    });

    this.dataSource.sort.sortChange.subscribe((sort: Sort) => {
      this.currentSort = sort;
      console.log(this.dataSource.sort);
      // debugger;
      const data = this.dataSource.allData;
      if (!sort.active || sort.direction === '') {
        this.dataSource.allData = data;
        return;
      }

      this.storage.setItem('defaultSortSubject', sort.active);

      this.dataSource.allData = data.sort((a, b) => {
        const isAsc = sort.direction === 'desc';
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

  placeholderWhen(index: number, _: any) {
    return index === 0;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.allData.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.allData.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
}
