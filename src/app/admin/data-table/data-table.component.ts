import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, NgZone, OnChanges, OnDestroy,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {DataSource, SelectionModel} from '@angular/cdk/collections';
import {MatSort, Sort} from '@angular/material';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import * as moment from 'moment';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {ScrollPositionService} from '../../scroll-position.service';
import {wrapToHtml} from '../helpers';
import {TABLE_RELOADING_TRIGGER} from '../accounts-role/accounts-role.component';

import { findIndex } from 'lodash';
import {debounceTime, delay, distinctUntilChanged, take, takeUntil} from 'rxjs/operators';
import {StorageService} from '../../services/storage.service';

const PAGESIZE = 50;
const ROW_HEIGHT = 38;

export class GridTableDataSource extends DataSource<any> {

  public  stickySpace: boolean;
  public _fixedColumnsPlaceholder: any = {
    placeholder: true
  };

  private _data: any[];
  private lastPage = 1;

  get last() {
    return this.lastPage;
  }

  set last(n: number) {
    this.lastPage = n;
  }

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
    private itemSize: number,
    sorting: MatSort,
    stickySpace: boolean,
    private domSanitizer: DomSanitizer,
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
    // console.log(this._fixedColumnsPlaceholder);
    this.viewport.elementScrolled().subscribe((ev: any) => {
      const start = Math.floor((ev.currentTarget.scrollTop >= 0 ? ev.currentTarget.scrollTop : 0) / ROW_HEIGHT);
      const prevExtraData = start > 0 && start <= 12 && this.stickySpace ? 1 : start > 12 ? 12 : 0;
      const slicedData = this._data.slice(start - prevExtraData, start + (PAGESIZE - prevExtraData)).concat(this._fixedColumnsPlaceholder);
      // console.log(start - prevExtraData, '-', start + (PAGESIZE - prevExtraData));

      this.offset = ROW_HEIGHT * (start - prevExtraData);
      this.viewport.setRenderedContentOffset(this.offset);
      this.offsetChange.next(this.offset);
      this.visibleData.next(slicedData);
    });
  }

  private readonly visibleData: BehaviorSubject<any[]> = new BehaviorSubject([]);

  add(data: any[]) {
    this._data.push(...data);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortingDataAccessor(item, property) {
    switch (property) {
      case 'Name':
        return item[property].split(' ')[1];
      case 'Date & Time':
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
  @Output() loadMoreAccounts: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;

  @Input() set lazyData(value: any[]) {
    if (value.length) {
      this.dataSource.add(value);
      this._data = this.dataSource.allData;
    }

  }

  @Input() set data(value: any[]) {
    this._data = [...value];
    if (!this.dataSource) {
      this.dataSource = new GridTableDataSource(
        this._data,
        this.viewport,
        ROW_HEIGHT,
        this.sort,
        this.stickySpace,
        this.domSanitizer
      );
      this.dataSource.offsetChange
        .pipe(distinctUntilChanged())
        .subscribe(offset => {
          this.placeholderHeight = offset;
          const isFirst = this.dataSource.last === 1;
          const isThree = this.dataSource.last >= 3;
          const isFour = this.dataSource.last >= 4;

          // const allowLoadMore = (
          //   (
          //     this.dataSource.last * 50) -
          //   (Math.ceil(offset / PAGESIZE) + (isFirst ? 10 : 0 ) - (isThree ? this.dataSource.last * 10 : 0))) +
          //   (isFour ? 60 : 0) === (this.dataSource.last * 50) - 20;
    console.log(((this.dataSource.last * ( isFirst ? 40 : 60)) + (isThree ? (this.counter * 20) : 0)) - Math.ceil(offset / PAGESIZE), (this.dataSource.last * 50) - 15);
          if (((this.dataSource.last * ( isFirst ? 40 : 60)) + (isThree ? (this.counter * 20) : 0)) - Math.ceil(offset / PAGESIZE) <= (this.dataSource.last * 50) - 15) {
            if (isThree) {
              this.counter += 1;
            }
            this.loadMoreAccounts.emit(null);
            this.dataSource.last = this.dataSource.last + 1;
          }
        });
    }
    this.dataSource.allData = this._data;
    this.dataSource.sort.sortChange.subscribe((sort: Sort) => {
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
  }

  itemSize = ROW_HEIGHT;
  columnsToDisplay: string[];
  dataSource: GridTableDataSource;
  selection = new SelectionModel<any>(true, []);
  darkMode$: Observable<boolean>;
  placeholderHeight = 0;
  counter = 1;

  private _data: any[] = [];
  private destroyOffset$ = new Subject();

  constructor(
    private _ngZone: NgZone,
    private darkTheme: DarkThemeSwitch,
    private domSanitizer: DomSanitizer,
    private scrollPosition: ScrollPositionService,
    private cdr: ChangeDetectorRef,
    private storage: StorageService
  ) {
    this.darkMode$ = this.darkTheme.isEnabled$.asObservable();
  }

  ngOnInit() {

    TABLE_RELOADING_TRIGGER.subscribe(({header, tableHeaders}) => {
      const itemIndex = findIndex(this.displayedColumns, (item) => {
        return item === header.label;
      });
      const headerIndex = this.columnsToDisplay[0] === 'select' ? header.index + 1 : header.index;
      const iIndex = this.columnsToDisplay[0] === 'select' ? itemIndex + 1 : itemIndex;
      if (itemIndex < 0) {
        this.columnsToDisplay.splice(headerIndex, 0, header.label);
      } else {
        this.columnsToDisplay.splice(iIndex, 1);
      }
    });

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

    const defaultSortSubject = this.storage.getItem('defaultSortSubject');
    let sortSubject: string;

    if (defaultSortSubject && this.columnsToDisplay.includes(defaultSortSubject)) {
      sortSubject = defaultSortSubject;
    } else if (this.columnsToDisplay.includes('Last sign-in')) {
      sortSubject = 'Last sign-in';
    } else if (this.columnsToDisplay.includes('Group(s)')) {
      sortSubject = 'Group(s)';
    } else {
      sortSubject = 'Name';
    }

    this.dataSource.sort.sort({
      id: sortSubject,
      start: 'asc',
      disableClear: false
    });

  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (this.scrollableAreaName && this.scrollPosition.getComponentScroll(this.scrollableAreaName)) {
      setTimeout(() => {
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

  selectedRowEmit(evt, row) {
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

}

