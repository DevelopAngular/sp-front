import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.scss']
})
export class PagerComponent implements OnInit {
  
  @Input() page = 1;
  @Input() pages = 2;

  constructor() { }

  get $pages(){
    return Array(this.pages).fill(1).map((x,i)=>(i+1));
  }

  ngOnInit() {
  }

  paginator() {
    if (this.page === this.pages) {
      this.page = 0;
    }
    this.page += 1;
  }

}
