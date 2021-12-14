import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {tooltipAnimation} from '../../../animations';

@Component({
  selector: 'app-custom-tool-tip',
  templateUrl: './custom-tool-tip.component.html',
  styleUrls: ['./custom-tool-tip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [tooltipAnimation]
})
export class CustomToolTipComponent implements OnInit {

  @Input() text;

  @Input() contentTemplate;

  constructor() { }

  ngOnInit() {
  }

}
