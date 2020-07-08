import {ChangeDetectionStrategy, Component, Input, OnInit, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {DomSanitizer} from '@angular/platform-browser';

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

  @Input() height: string = '800px';
  @Input() displayedColumns: CustomTableColumns;
  @Input() data;

  @ViewChild(CdkVirtualScrollViewport)
  public viewPort: CdkVirtualScrollViewport;

  constructor(
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
  }

  disableSortColumns() {
    return 0;
  }

  getGradient(gradient: string) {
    const colors = gradient.split(',');
    return 'radial-gradient(circle at 73% 71%, ' + (colors[0]) + ', ' + colors[1] + ')';
  }

  generateColumnData(value, field, element: HTMLElement) {
    if (field === 'icon') {
      return element.innerHTML = `<img width="13" src="${value}" alt="Icon">`;
    } else {
      return value;
    }
  }

  columnClick(key) {
    debugger
  }

}
