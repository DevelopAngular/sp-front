import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {DataSource, SelectionModel} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {MatDialog, MatSort, Sort} from '@angular/material';
import * as moment from 'moment';
import {StorageService} from '../../services/storage.service';
import {ColumnOptionsComponent} from './column-options/column-options.component';
import {UNANIMATED_CONTAINER} from '../../consent-menu-overlay';
import {TableService} from './table.service';
import {cloneDeep} from 'lodash';
import {debounceTime, delay, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {HallPassesService} from '../../services/hall-passes.service';
import {PassCardComponent} from '../../pass-card/pass-card.component';
import {GeneratedTableDialogComponent} from './generated-table-dialog/generated-table-dialog.component';

const PAGESIZE = 50;
const ROW_HEIGHT = 33;

export class GridTableDataSource extends DataSource<any> {
  private _data: any[];
  loadedData$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get allData(): any[] {
    return this._data.slice();
  }

  set allData(data: any[]) {
    this._data = data;
    // this.viewport.scrollToOffset(0);
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
          this.loadedData$.next(true);
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
      case 'Student Name':
        return item[property];
      case 'Pass start time':
      case 'Contact date':
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
export class SpDataTableComponent implements OnInit, OnDestroy {

  @Input() isCheckbox: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  @Input() data$: Observable<any>;
  @Input() height: string = 'calc(100vh - 200px)';

  @Input() loading$: Observable<boolean>;

  @Input() showEmptyState: boolean;
  @Input() emptyIcon: string;
  @Input() emptyText: string;

  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
  @ViewChild(MatSort) sort: MatSort;

  @Output() loadMoreData: EventEmitter<any> = new EventEmitter<any>();

  placeholderHeight = 0;
  displayedColumns: string[];
  columnsToDisplay: string[];
  tableInitialColumns: string[];
  dataSource: GridTableDataSource;
  selection = new SelectionModel<any>(true, []);
  itemSize = 33;
  currentSort: {active: string, direction: string}[] = [];
  tableOptionButtons = [
    { icon: 'Columns', action: 'column' },
    { icon: 'Print', action: 'print' },
    { icon: 'CSV', action: 'csv'}
  ];
  selectedRows: any[];
  disableRowClick: boolean;

  destroy$ = new Subject();

  constructor(
    private cdr: ChangeDetectorRef,
    private storage: StorageService,
    private dialog: MatDialog,
    private tableService: TableService,
    private hallpassService: HallPassesService
  ) {}

  get viewportDataItems(): number {
    return Math.floor(this.viewport.getViewportSize() / ROW_HEIGHT);
  }

  ngOnInit() {
    this.dataSource = new GridTableDataSource(this.data$, this.viewport, this.itemSize);
    this.dataSource.sort = this.sort;
    this.dataSource.offsetChange.pipe(takeUntil(this.destroy$))
      .subscribe(offset => this.placeholderHeight = offset);

    this.viewport.scrolledIndexChange.subscribe(res => {
      if (res === (this.dataSource.allData.length - this.viewportDataItems)) {
        this.loadMoreData.emit();
        console.log('loading data ==>>>>');
      }
    });

    this.dataSource.loadedData$.pipe(
      filter(value => value && this.dataSource.allData[0]),
      switchMap(value => {
        if (!!this.selection.selected.length) {
          this.selectedRows = cloneDeep(this.selection.selected);
          this.selection.clear();
          // this.selectedRows.forEach(row => {
          //     this.select(row);
          //     this.cdr.detectChanges();
          // });
        }
        this.displayedColumns = Object.keys(this.dataSource.allData[0]);
        this.columnsToDisplay = this.displayedColumns.slice();
        return this.isCheckbox;
      }),
      takeUntil(this.destroy$)
    ).subscribe((v) => {
        if (v) {
          this.columnsToDisplay.unshift('select');
        } else if (!v && (this.columnsToDisplay[0] === 'select')) {
          this.columnsToDisplay.shift();
          this.selection.clear();
        }
        this.tableInitialColumns = cloneDeep(this.columnsToDisplay);
      });

    this.dataSource.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe((sort: Sort) => {
      const activeSort = this.currentSort.find(curr => curr.active === sort.active);
      if (!activeSort) {
        this.currentSort.push(sort);
      } else {
        activeSort.direction = sort.direction;
      }

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

    if (!this.selection.isEmpty()) {
      this.selection.clear();
    }

    this.tableService.updateTableColumns$
      .pipe(takeUntil(this.destroy$))
      .subscribe((columns: string[]) => {
        this.columnsToDisplay = ['select', this.displayedColumns[0], ...columns];
        this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  select(row) {
    this.selection.toggle(row);
    this.cdr.detectChanges();
  }

  placeholderWhen(index: number, _: any) {
    return index === 0;
  }

  getColumnSort(column) {
    const activeSort = this.currentSort.find(sort => sort.active === column);
    if (activeSort) {
      return activeSort.direction;
    } else {
      return null;
    }
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
    // console.log(this.selection.selected.length);
  }

  checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  rowOnClick(row) {
    if (!this.disableRowClick) {
      this.selection.toggle(row);
    }
    this.disableRowClick = false;
  }

  cellClick(element, column?) {
    if (column === 'Pass') {
      this.disableRowClick = true;
      this.hallpassService.passesEntities$
        .pipe(
          takeUntil(this.destroy$),
          map(passes => {
          return passes[element.id];
        })).subscribe(pass => {
        pass.start_time = new Date(pass.start_time);
        pass.end_time = new Date(pass.end_time);
        const data = {
          pass: pass,
          fromPast: true,
          forFuture: false,
          forMonitor: false,
          isActive: false,
          forStaff: true,
        };
        const dialogRef = this.dialog.open(PassCardComponent, {
          panelClass: 'search-pass-card-dialog-container',
          backdropClass: 'custom-bd',
          data: data,
        });
      });
    }
  }

  openOption(action: string, event) {
    if (action === 'column') {
      UNANIMATED_CONTAINER.next(true);
      const CD = this.dialog.open(ColumnOptionsComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'trigger': event.currentTarget,
          'columns': this.displayedColumns.slice(1)
        }
      });

      CD.afterClosed().subscribe(res => {
        UNANIMATED_CONTAINER.next(false);
        this.cdr.detectChanges();
      });
    } else if (action === 'csv' && this.selection.selected.length) {
      UNANIMATED_CONTAINER.next(true);
      const csv = this.dialog.open(GeneratedTableDialogComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        disableClose: true,
        data: {
          'trigger': event.currentTarget,
          'header': 'CSV Generated',
          'subtitle': 'Download it to your computer now.',
          'selected': this.selection.selected
        }
      });

      csv.afterClosed().subscribe(res => {
        UNANIMATED_CONTAINER.next(false);
        this.cdr.detectChanges();
      });
    }
  }
}
