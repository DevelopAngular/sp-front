import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.scss']
})
export class PagerComponent implements OnInit {

  @Input() page = 1;
  @Input() pages = 2;

  @Input() arrowPosition: string = '-17px';

  hideRightButton = new BehaviorSubject(false);
  hideLeftButton = new BehaviorSubject(true);

  constructor() { }

  get $pages() {
    return Array(this.pages).fill(1).map((x, i) => (i + 1));
  }

  ngOnInit() {
      if (this.page === 1 && this.pages === 1) {
          this.hideLeftButton.next(false);
      }
      if (this.page === 1 && this.pages === 2) {
        this.hideLeftButton.next(false);
        this.hideRightButton.next(true);
      }
  }

  leftPaginator() {
    this.hideRightButton.next(true);
    if (this.page === 2) {
      this.hideLeftButton.next(false);
    }
    if (this.page >= 1) {
        this.page -= 1;
    }
  }

  RightPaginator() {
    this.hideLeftButton.next(true);
    if (this.page === 1 && this.pages === 2
        || this.page === 2 && this.pages === 3
        || this.page === 3 && this.pages === 4) {
      this.hideRightButton.next(false);
    }
    this.page += 1;
  }
  DotPagination(dot) {
    this.page = dot;
    if (dot === 1) {
      this.hideLeftButton.next(false);
      this.hideRightButton.next(true);
    }
    if (dot > 1 && dot < this.$pages.length + 1) {
      this.hideLeftButton.next(true);
      this.hideRightButton.next(true);
    }
    if (dot === this.$pages.length) {
      this.hideLeftButton.next(true);
      this.hideRightButton.next(false);
    }

  }
}
