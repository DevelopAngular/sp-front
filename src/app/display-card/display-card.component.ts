import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-display-card',
  templateUrl: './display-card.component.html',
  styleUrls: ['./display-card.component.scss']
})
export class DisplayCardComponent implements OnInit {

  @Input() hasDivider: boolean = true;
  @Input() inbox: boolean = false;
  @Input() title: string;
  @Input() icon: string;
  @Input() fontSize: string;

  notifications: number = 1;

  constructor() { }

  ngOnInit() {
  }

}
