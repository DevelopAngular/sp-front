import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input, NgZone,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {DataSource, SelectionModel} from '@angular/cdk/collections';
import {MatSort, MatTableDataSource} from '@angular/material';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {DomSanitizer} from '@angular/platform-browser';
import {BehaviorSubject, Observable} from 'rxjs';

import * as moment from 'moment';
import {SP_ARROW_BLUE_GRAY, SP_ARROW_DOUBLE_BLUE_GRAY} from '../pdf-generator.service';
import {CdkScrollable, ScrollDispatcher} from '@angular/cdk/overlay';
import {CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {map} from 'rxjs/operators';

const PAGESIZE = 20;
const ROW_HEIGHT = 48;

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
  constructor(initialData: any[], private viewport: CdkVirtualScrollViewport, private itemSize: number, sorting: MatSort) {
    super();
    this._data = initialData;
    this.sort = sorting;
    this.viewport.elementScrolled().subscribe((ev: any) => {
      const start = Math.floor(ev.currentTarget.scrollTop / ROW_HEIGHT);
      const prevExtraData = start > 5 ? 5 : 0;
      // const prevExtraData = 0;
      const slicedData = this._data.slice(start - prevExtraData, start + (PAGESIZE - prevExtraData));
      this.offset = ROW_HEIGHT * (start - prevExtraData);
      this.viewport.setRenderedContentOffset(this.offset);
      this.offsetChange.next(this.offset)
      this.visibleData.next(slicedData);
    });
  }

  private readonly visibleData: BehaviorSubject<any[]> = new BehaviorSubject([]);

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
export class DataTableComponent implements OnInit {

  @Input() width: string = '100%';
  @Input() height: string = 'none';
  @Input() isCheckbox: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  @Input() isAllowedSelectRow: boolean = false;
  @Input() set data(value: any[]) {
    this._data = [...value];
      this.dataSource = new GridTableDataSource(this._data, this.viewport, 38, this.sort);
    this.dataSource.offsetChange.subscribe(offset => {
      this.placeholderHeight = offset;
    })
    this.dataSource.allData = this._data;
      // this.dataSource = new MatTableDataSource(this._data);
      // this.dataSource.sort = this.sort;
      // this.dataSource.sortingDataAccessor = (item, property) => {
      //     switch (property) {
      //         case 'Name':
      //             return item[property].split(' ')[1];
      //         case 'Date & Time':
      //             return Math.min(moment().diff(item['date'], 'days'));
      //         case 'Duration':
      //             return item['sortDuration'].as('milliseconds');
      //         case 'Profile(s)':
      //             return item[property].map(i => i.title).join('');
      //         default:
      //             return item[property];
      //     }
      // };
  }
  @Input() disallowHover: boolean = false;
  @Input() backgroundColor: string = 'transparent';
  @Input() textColor: string = 'black';
  @Input() textHeaderColor: string = '#7F879D';
  @Input() marginTopStickyHeader: string = '-40px';

  @Output() selectedUsers: EventEmitter<any[]> = new EventEmitter();
  @Output() selectedRow: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedCell: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('stickyHeader') stickyHeader: ElementRef;
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;


  @Input() displayedColumns: string[];
  columnsToDisplay: string[];
  // dataSource: MatTableDataSource<any[]>;
  // dataSource: any[];
  dataSource: GridTableDataSource;
  selection = new SelectionModel<any>(true, []);

  hovered: boolean;
  hoveredRowIndex: number;
  pressed: boolean;

  darkMode$: Observable<boolean>;

  stickyOffsetSubject = new BehaviorSubject<string>('');
  stickyOffset$: Observable<string> = this.stickyOffsetSubject.asObservable();

  public _data: any[] = [];


  placeholderHeight = 0;


  constructor(
    private _ngZone: NgZone,
    private darkTheme: DarkThemeSwitch,
    public scrollDispatcher: ScrollDispatcher) {
    this.darkMode$ = this.darkTheme.isEnabled$.asObservable();
  }

  ngOnInit() {
    console.log(this._data);
    this.marginTopStickyHeader = '0px';
    // this
    //   .table
    //   .elementScrolled()
    //   .subscribe(data => {
    //       console.log(this.table.getOffsetToRenderedContentStart());
    //       this._ngZone.run(() => {
    //         const offset = this.table.getOffsetToRenderedContentStart();
    //         this.stickyOffsetSubject.next(`-${offset}px`);
    //       });
    //     }
    //   );
    // this.stickyOffset$.subscribe((res) => {
    //   console.log(res);
    //   this.stickyHeader.nativeElement.style.transform = res;
    // })
      if (!this.displayedColumns) {
        this.displayedColumns = Object.keys(this._data[0]);
      }
      this.columnsToDisplay = this.displayedColumns.slice();
    this.isCheckbox.subscribe((v) => {
      if (v) {
        this.columnsToDisplay.unshift('select');
      } else if (!v && (this.columnsToDisplay[0] === 'select')) {
        this.columnsToDisplay.shift();
      }
    });
  }
  placeholderWhen(index: number, _: any) {
    return index == 0;
  }
  // onHover(evt: MouseEvent) {
  //   console.log((evt.target as HTMLElement).dataset);
    // const target = (evt.target as HTMLElement).closest('.mat-row') as HTMLElement ;
    // this.hovered = true;
    // target.style.backgroundColor = this.getBgColor({hovered: true});
    // target.style.color = this.getCellColor({hovered: true});
    // target.style.userSelect = 'none';
    // target.style.cursor = this.disallowHover ? 'default' : 'pointer';
  // }
  // onLeave(evt: MouseEvent) {
  //   const target = (evt.target as HTMLElement).closest('.mat-row') as HTMLElement ;
  //
  //   this.hovered = false;
  //   target.style.color = this.getCellColor({hovered: false});
  //   target.style.backgroundColor = this.getBgColor({hovered: false});
  // }
  // onDown(target: HTMLElement) {
  //
  //   this.pressed = true;
  //   target.style.backgroundColor = this.getBgColor();
  // }
  //
  // onUp(target: HTMLElement) {
  //
  //   this.pressed = false;
  //   target.style.backgroundColor = this.getBgColor();
  // }


  getBgColor(elem?) { //can being as a cell as also an entire row
    if (!this.disallowHover) {
      if (elem.hovered) {
        if (elem.pressed) {
          return this.darkTheme.isEnabled$.value ? '#09A4F7' : '#E2E7F4';
        } else {
          return this.darkTheme.isEnabled$.value ? '#0991c3' : '#ECF1FF';
        }
      } else if (this.isCheckbox.value && elem.pressed) {
          return this.darkTheme.isEnabled$.value ? '#09A4F7' : '#E2E7F4';
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
    if (this.isAllSelected() )  {
      this.selection.clear();
      this._data.forEach(row => {
        row.pressed = false;
      });
    } else {
      this._data.forEach(row => {
        this.selection.select(row);
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
    if (typeof cellElement !== 'string' && cellElement.title !== 'No profile' && !(cellElement instanceof Location) && !this.isCheckbox.value) {
      event.stopPropagation();
      cellElement.row = element;
      this.selectedCell.emit(cellElement);
    } else {
      return;
    }
  }

  selectedRowEmit(row) {
    if (this.isCheckbox.value && !this.isAllowedSelectRow) {
      this.selection.toggle(row);
      row.pressed = this.selection.isSelected(row);
      this.pushOutSelected();
    } else {
      this.selectedRow.emit(row);
    }

  }

  pushOutSelected() {
    this.selectedUsers.emit(this.selection.selected);
  }

  clearSelection() {
    this.selection.clear();
  }

}

