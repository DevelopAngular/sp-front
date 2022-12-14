import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {tooltipAnimation} from '../../../animations';

@Component({
  selector: 'app-custom-tool-tip',
  templateUrl: './custom-tool-tip.component.html',
  styleUrls: ['./custom-tool-tip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [tooltipAnimation]
})
export class CustomToolTipComponent implements OnInit {

  @Input() text: string;
  @Input() allowVarTag: boolean;

  @Input() contentTemplate: TemplateRef<any>;
  @ViewChild('simpleText', {static: true}) defaultTpl!: TemplateRef<HTMLElement>;

  @Input() width: string;
  @Input() nonDisappearing: boolean;

  @Output() overEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() closeTooltip: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {
    if (!this.contentTemplate) {
      this.contentTemplate = this.defaultTpl;
    }
  }
}
