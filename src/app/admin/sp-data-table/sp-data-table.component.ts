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
  ViewChild
} from '@angular/core';
import {DataSource, SelectionModel} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {MatDialog} from '@angular/material/dialog';
import {MatSort} from '@angular/material/sort';
import {StorageService} from '../../services/storage.service';
import {ColumnOptionsComponent} from './column-options/column-options.component';
import {UNANIMATED_CONTAINER} from '../../consent-menu-overlay';
import {TableService} from './table.service';
import {cloneDeep, omit} from 'lodash';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import {HallPassesService} from '../../services/hall-passes.service';
import {ToastService} from '../../services/toast.service';
import {XlsxGeneratorService} from '../xlsx-generator.service';

const PAGESIZE = 50;
const ROW_HEIGHT = 33;

export class GridTableDataSource extends DataSource<any> {
  private _data: any[];
  loadedData$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get allData(): any[] {
    return this._data ? this._data.slice() : [];
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

  destroy$ = new Subject();

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
      const start = Math.floor((ev.currentTarget.scrollTop >= 0 ? ev.currentTarget.scrollTop : 0) / ROW_HEIGHT);
      const prevExtraData = start > 0 && start <= 12 ? 1 : start > 12 ? 12 : 0;
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

  @Input() loading$: Observable<boolean>;

  @Input() showEmptyState: boolean;
  @Input() emptyIcon: string;
  @Input() emptyText: string;
  @Input() currentPage: string;
  @Input() isRowClick: boolean;
  @Input() showPrintButtons: boolean = true;
  @Input() sort: string = '';
  @Input() sortColumn: string;
  @Input() sortLoading$: Observable<boolean>;

  @ViewChild(CdkVirtualScrollViewport, { static: true }) viewport: CdkVirtualScrollViewport;

  @Output() loadMoreData: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowClickEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortClickEvent: EventEmitter<string> = new EventEmitter<string>();

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
    // { icon: 'Print', action: 'print' },
    { icon: 'CSV', action: 'csv'}
  ];
  selectedRows: any[];
  hasHorizontalScroll: boolean;
  loadingCSV$: Observable<boolean>;
  preventRole: string;

  destroy$ = new Subject();

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
    private hallpassService: HallPassesService,
    private toastService: ToastService,
    public xlsx: XlsxGeneratorService
  ) {}

  get viewportDataItems(): number {
    return Math.floor(this.viewport.getViewportSize() / ROW_HEIGHT);
  }

  ngOnInit() {
    this.dataSource = new GridTableDataSource(this.data$, this.viewport, this.itemSize);
    this.dataSource.offsetChange.pipe(takeUntil(this.destroy$))
      .subscribe(offset => {
        this.placeholderHeight = offset;
        const doc = document.querySelector('.example-viewport');
        this.hasHorizontalScroll = doc.scrollWidth > doc.clientWidth;
      });

    this.viewport.scrolledIndexChange
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
      if (res && res >= (this.dataSource.allData.length - this.viewportDataItems)) {
        this.loadMoreData.emit();
        console.log('loading data ==>>>>');
      }
    });

    this.loadingCSV$ = this.tableService.loadingCSV$.asObservable();

    this.dataSource.loadedData$.pipe(
      filter(value => value && this.dataSource.allData[0]),
      switchMap(value => {
        if (!!this.selection.selected.length) {
          this.selectedRows = cloneDeep(this.selection.selected);
          this.selection.clear();
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
          this.selection.clear();
        }
        this.tableInitialColumns = cloneDeep(this.columnsToDisplay);
      });

    this.toastService.toastButtonClick$
      .pipe(
        takeUntil(this.destroy$),
        filter(action => action === 'bulk_add_link')
      )
      .subscribe((action) => {
        if (this.selection.selected.length > 5000 || !this.selection.selected.length) {
          window.open('https://www.smartpass.app/bulk-export');
        } else {
          this.generateCSV();
        }
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

    this.tableService.clearSelectedUsers
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.selection.clear();
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
    this.tableService.selectRow.next(this.selection.selected);
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
      this.dataSource.allData.forEach(row => {
        this.selection.select(row);
      });
    this.tableService.selectRow.next(this.selection.selected);
    // console.log(this.selection.selected.length);
  }

  checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
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
    } else if (action === 'csv') {
      if (this.selection.selected.length > 5000 || !this.selection.selected.length) {
        this.toastService.openToast(
          {
            title: 'Information Required',
            subtitle: 'We need some additional information to export your data (5000+ passes)',
            icon: './assets/External Link (Navy).svg',
            buttonText: 'See form',
            action: 'bulk_add_link'
          }
        );
      } else {
        this.toastService.openToast(
          {title: 'CSV Generated', subtitle: 'Download it to your computer now.', action: 'bulk_add_link'}
        );
      }
    }
  }

  generateCSV() {
    const exceptPass = this.selection.selected.map(row => {
      if (row['Contact connection']) {
        const str = row['Contact connection'].changingThisBreaksApplicationSecurity;
        row['Contact connection'] = str.replace(/(<[^>]+>)+/g, ``);
      }
      return omit(row, ['Pass', 'Passes']);
    });
    const fileName = this.currentPage === 'pass_search' ?
      'SmartPass-PassSearch' : this.currentPage === 'contact_trace' ?
        'SmartPass-ContactTracing' : 'TestCSV';
    this.xlsx.generate(exceptPass, fileName);
  }

  sortHeader(column) {
    this.sortClickEvent.emit(column);
  }
}
