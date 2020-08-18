import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-custom-tool-tip',
  templateUrl: './custom-tool-tip.component.html',
  styleUrls: ['./custom-tool-tip.component.scss']
})
export class CustomToolTipComponent implements OnInit {

  @Input() text;

  @Input() contentTemplate;

  constructor() { }

  ngOnInit() {
  }

}
