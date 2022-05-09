import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-pass-limit-tooltip',
  templateUrl: './pass-limit-tooltip.component.html',
  styleUrls: ['./pass-limit-tooltip.component.scss']
})
export class PassLimitTooltipComponent implements OnInit {

  @Input() description: string;

  @Input() isHand: boolean = true;

  constructor() { }

  ngOnInit() {
  }

}
