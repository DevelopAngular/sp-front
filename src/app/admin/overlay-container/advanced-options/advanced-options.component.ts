import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-advanced-options',
  templateUrl: './advanced-options.component.html',
  styleUrls: ['./advanced-options.component.scss']
})
export class AdvancedOptionsComponent implements OnInit {

  openedContent: boolean;

  constructor() { }

  ngOnInit() {
  }

  toggleContent() {
    this.openedContent = !this.openedContent;
  }

}
