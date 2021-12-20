import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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

  @Output() overEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() closeTooltip: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
    // console.log('open');
  }

}
