import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-display-card',
  templateUrl: './display-card.component.html',
  styleUrls: ['./display-card.component.css']
})
export class DisplayCardComponent implements OnInit {

  @Input() hasDivider: boolean = true;
  @Input() title: string;
  @Input() icon: string;
  @Input() fontSize: string;

  constructor() { }

  ngOnInit() {
  }

}
