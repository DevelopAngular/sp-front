import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {DataSource, SelectionModel} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {MatDialog} from '@angular/material/dialog';
import {MatSort} from '@angular/material/sort';
import {StorageService} from '../../services/storage.service';
import {ColumnOptionsComponent} from './column-options/column-options.component';
import {UNANIMATED_CONTAINER} from '../../consent-menu-overlay';
import {TableService} from './table.service';
import {cloneDeep, isEmpty} from 'lodash';
import {filter, switchMap, takeUntil, withLatestFrom} from 'rxjs/operators';
import {DomSanitizer} from '@angular/platform-browser';
//import {StatusChipComponent} from '../explore/status-chip/status-chip.component';

const PAGESIZE = 50;
const ROW_HEIGHT = 33;

export class GridTableDataSource extends DataSource<any> {
  private _data: any[];
  loadedData$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly visibleData: BehaviorSubject<any[]> = new BehaviorSubject([]);

  sort: MatSort | null;
  offset = 0;

  destroy$ = new Subject();

  get allData(): any[] {
    return this._data ? this._data.slice() : [];
  }

  set allData(data: any[]) {
    this._data = data;
    // this.viewport.scrollToOffset(this.offset);
    this.viewport.setTotalContentSize(this.itemSize * data.length);
    this.visibleData.next(this._data);
  }

  setFakeData(data) {
    this.allData = data;
  }

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
      const start = Math.floor((ev.currentTarget.scrollTop >= 0 ? ev.currentTarget.scrollTop : 0) / itemSize);
      const prevExtraData = start > 0 && start <= 12 ? 1 : start > 12 ? 12 : 0;
      const slicedData = this._data.slice(start - prevExtraData, start + (PAGESIZE - prevExtraData));
      this.offset = itemSize * (start - prevExtraData);
      // this.viewport.setRenderedContentOffset(this.offset);
      // this.offsetChange.next(this.offset);
      // this.visibleData.next(slicedData);
    });
  }

  connect(collectionViewer: import('@angular/cdk/collections').CollectionViewer): Observable<any[] | ReadonlyArray<any>> {
    return this.visibleData.asObservable();
    // return this.initialData$;
  }

  disconnect(collectionViewer: import('@angular/cdk/collections').CollectionViewer): void {
    // this.destroy$.next();
    // this.destroy$.complete();
  }
}

@Injectable()
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

  @Input() loading$: Observable<boolean> = of(false);

  @Input() showEmptyState: boolean;
  @Input() emptyIcon: string;
  @Input() emptyText: string;
  @Input() currentPage: string;
  @Input() isRowClick: boolean;
  @Input() showPrintButtons: boolean = true;
  @Input() sort: string = '';
  @Input() sortColumn: string;
  @Input() sortLoading$: Observable<boolean>;
  @Input() itemSize = 33;
  @Input() disabledInfinityScroll: boolean;

  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewport: CdkVirtualScrollViewport;

  @Output() loadMoreData: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowClickEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortClickEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() exportPasses: EventEmitter<any> = new EventEmitter<any>();

  displayedColumns: string[];
  columnsToDisplay: string[];
  tableInitialColumns: string[];
  dataSource: GridTableDataSource;
  selection = new SelectionModel<any>(true, []);

  tableOptionButtons = [
    {icon: 'Columns', action: 'column'},
    // { icon: 'Print', action: 'print' },
    {icon: 'CSV', action: 'csv'}
  ];
  selectedRows: any[];
  fakedata;
  hasHorizontalScroll: boolean;
  loadingCSV$: Observable<boolean>;

  selectedObjects: {
    [id: number]: any
  } = {};

  destroy$ = new Subject();

  fakeTemplate;

  @HostListener('window:resize', ['$event'])
  resize(event) {
    const doc = document.querySelector('.example-viewport');
    this.hasHorizontalScroll = doc.scrollWidth > doc.clientWidth;
  }


  constructor(
    private cdr: ChangeDetectorRef,
    private storage: StorageService,
    private dialog: MatDialog,
    private tableService: TableService,
    private domSanitizer: DomSanitizer,
  ) {
  }

  get viewportDataItems(): number {
    return Math.floor(this.viewport.getViewportSize() / this.itemSize);
  }

  ngOnInit() {
    this.dataSource = new GridTableDataSource(this.data$, this.viewport, this.itemSize);
    this.fakedata = this.generateFakeData();
    this.fakeTemplate = this.domSanitizer.bypassSecurityTrustHtml(
      `<div class="fake-container-block"
                style="margin-left: ${this.currentPage === 'pass_search' ? '10%' : 'auto'}; width: ${this.currentPage === 'pass_search' ? '90%' : '100%'}"
            ><div class="fake-block animate"></div></div>`
    );

    this.viewport.scrolledIndexChange
      .pipe(
        withLatestFrom(this.loading$),
        filter(() => !this.disabledInfinityScroll),
        takeUntil(this.destroy$),
      )
      .subscribe(([res, loading]) => {
        if (res && !loading && res >= (this.dataSource.allData.length - this.viewportDataItems)) {
          this.loadMoreData.emit();
          this.dataSource.setFakeData([...this.dataSource.allData, ...this.fakedata]);
          console.log('loading data ==>>>>');
        }
      });

    this.loadingCSV$ = this.tableService.loadingCSV$.asObservable();

    this.dataSource.loadedData$.pipe(
      filter(value => value && this.dataSource.allData[0]),
      switchMap(value => {
        if (!!this.selectedHasValue()) {
          this.selectedRows = cloneDeep(Object.values(this.selectedObjects));
          this.selectedObjects = {};
        }
        this.displayedColumns = Object.keys(this.dataSource.allData[0]);
        const savedColumns = JSON.parse(this.storage.getItem(this.currentPage));
        this.columnsToDisplay = this.storage.getItem(this.currentPage) ? [this.displayedColumns[0], ...this.displayedColumns.slice(1).filter(col => {
          return savedColumns[col];
        })] : this.displayedColumns.slice();
        return this.isCheckbox;
      }),
      takeUntil(this.destroy$)
    ).subscribe((v) => {
      if (v) {
        this.columnsToDisplay.unshift('select');
      } else if (!v && (this.columnsToDisplay[0] === 'select')) {
        this.columnsToDisplay.shift();
      }

      this.tableInitialColumns = cloneDeep(this.columnsToDisplay);
    });

    if (!this.selectedHasValue()) {
      this.selectedObjects = {};
    }

    this.tableService.updateTableColumns$.pipe(withLatestFrom(this.isCheckbox), takeUntil(this.destroy$))
      .subscribe(([columns, isCheckbox]) => {
        this.columnsToDisplay = isCheckbox ? ['select', this.displayedColumns[0], ...columns] : [this.displayedColumns[0], ...columns];
        this.cdr.detectChanges();
      });

    this.tableService.clearSelectedUsers
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.selectedObjects = {};
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.tableService.isAllSelected$.next(false);
    this.tableService.selectRow.next([]);
    this.destroy$.next();
    this.destroy$.complete();
  }

  select(row) {
    this.rowSelect(row);
    this.cdr.detectChanges();
    this.tableService.selectRow.next(Object.values(this.selectedObjects));
  }

  rowSelect(object) {
    if (this.isSelected(object)) {
      delete this.selectedObjects[object.id];
    } else {
      this.selectedObjects = {
        ...this.selectedObjects,
        [object.id]: object
      };
    }
  }

  isSelected(row) {
    return !!this.selectedObjects[row.id];
  }

  selectedHasValue() {
    return !isEmpty(this.selectedObjects);
  }

  isAllSelected() {
    const numSelected = Object.keys(this.selectedObjects).length;
    const numRows = this.dataSource.allData.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selectedObjects = {};
      this.tableService.isAllSelected$.next(false);
    } else {
      this.tableService.isAllSelected$.next(true);
      this.selectedObjects = this.dataSource.allData.reduce((acc, curr) => {
        return {...acc, [curr.id]: curr};
      }, {});
    }
    this.tableService.selectRow.next(Object.values(this.selectedObjects));
  }

  checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  rowOnClick(row) {
    this.rowClickEvent.emit(row);
  }

  openOption(action: string, event) {
    if (action === 'column') {
      UNANIMATED_CONTAINER.next(true);
      const CD = this.dialog.open(ColumnOptionsComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'trigger': event.currentTarget,
          'columns': this.displayedColumns.slice(1),
          'currentPage': this.currentPage
        }
      });

      CD.afterClosed().subscribe(res => {
        UNANIMATED_CONTAINER.next(false);
        this.cdr.detectChanges();
      });
    }
  }

  sortHeader(column) {
    this.sortClickEvent.emit(column);
  }

  generateFakeItems(): Array<string> {
    const indexes = [];
    for (let i = 0; i < this.viewportDataItems; i++) {
      indexes.push('Fake' + i);
    }
    return indexes;
  }

  generateFakeData() {
    const dataIndex = [];
    for (let i = 0; i < 30; i++) {
      dataIndex.push({
        'Pass': this.domSanitizer.bypassSecurityTrustHtml(`<div class="pass-icon animate" style="background: #F4F4F4; cursor: pointer"></div>`),
        'isFake': true
      });
    }
    return dataIndex;
  }
}
