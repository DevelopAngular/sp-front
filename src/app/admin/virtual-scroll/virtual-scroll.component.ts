
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {
  CdkVirtualScrollViewport,
  FixedSizeVirtualScrollStrategy,
  VIRTUAL_SCROLL_STRATEGY
} from '@angular/cdk/scrolling';
/**
 * Data source
 */
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import {SP_ARROW_BLUE_GRAY, SP_ARROW_DOUBLE_BLUE_GRAY} from '../pdf-generator.service';

const PAGESIZE = 50;
const ROW_HEIGHT = 38;

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

  offset = 0;
  offsetChange = new BehaviorSubject(0);
  constructor(initialData: any[], private viewport: CdkVirtualScrollViewport, private itemSize: number) {
    super();
    this._data = initialData;
    this.viewport.elementScrolled().subscribe((ev: any) => {
      const start = Math.floor(ev.currentTarget.scrollTop / ROW_HEIGHT);
      const prevExtraData = start > 12 ? 12 : 0;
      // const prevExtraData = 0;
      const slicedData = this._data.slice(start - prevExtraData, start + (PAGESIZE - prevExtraData));
      this.offset = ROW_HEIGHT * (start - prevExtraData);
      this.viewport.setRenderedContentOffset(this.offset);
      this.offsetChange.next(this.offset)
      this.visibleData.next(slicedData);
      if (prevExtraData > 0) {
        console.log(start - prevExtraData, start + (PAGESIZE - prevExtraData));
      } else {
        console.log('WAIT >>>>>>>');
      }
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
  selector: 'app-virtual-scroll',
  templateUrl: './virtual-scroll.component.html',
  styleUrls: ['./virtual-scroll.component.scss'],
  providers: [{provide: VIRTUAL_SCROLL_STRATEGY, useClass: CustomVirtualScrollStrategy}],
})
export class VirtualScrollComponent implements OnInit {

  placeholderHeight = 0;
  displayedColumns: string[];
    // = ['id', 'name', 'age', 'test', 'west'];
  dataSource: GridTableDataSource;
  @Input() rows: any[];

  //   = Array(800).fill(0).map((x, i) => {
  //   return {name: 'name' + i, id: i, age: 27, test: 'test', west: 'west'};
  // });
  itemSize = ROW_HEIGHT;
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;

  constructor(

  ) {
  }

  ngOnInit() {
    this.displayedColumns = Object.keys(this.rows[0]);


    this.dataSource = new GridTableDataSource(this.rows, this.viewport, this.itemSize);
    this.dataSource.offsetChange.subscribe(offset => {
      this.placeholderHeight = offset;
    })
    this.dataSource.allData = this.rows;
  }

  placeholderWhen(index: number, _: any) {
    return index == 0;
  }

  // normalizeCell(cellData) {
  //   if (!cellData) {
  //     return new Array(0);
  //   }
  //   if (Array.isArray(cellData)) {
  //     return cellData;
  //   } else {
  //     return  new Array(cellData);
  //   }
  // }
  // displayCell(cellElement, cell?, column?) {
  //   let value = '';
  //   if (typeof cellElement === 'string') {
  //     if (column === 'TT') {
  //       if (cellElement === 'one_way') {
  //         value = SP_ARROW_BLUE_GRAY;
  //       }
  //       if (cellElement === 'round_trip' || cellElement === 'both') {
  //         value = SP_ARROW_DOUBLE_BLUE_GRAY;
  //       }
  //       cell.innerHTML = value;
  //       return;
  //     } else {
  //       value = cellElement;
  //     }
  //   } else {
  //     value = cellElement.title ? cellElement.title : 'Error!';
  //   }
  //
  //   return value;
  // }

}
