import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {bumpIn} from '../../animations';

@Component({
  selector: 'app-icon-only-button',
  templateUrl: './icon-only-button.component.html',
  styleUrls: ['./icon-only-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [bumpIn]
})
export class IconOnlyButtonComponent implements OnInit {

  @Input() icon: string;
  @Input() size: 'small' | 'regular';

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

  hovered: boolean;
  pressed: boolean;

  width: string;
  iconWidth: string;

  constructor() { }

  get bg() {
    if (this.hovered) {
      if (this.pressed) {
        return '#E2E6EC';
      }
      return '#EAEDF1';
    }
    return 'transparent';
  }

  ngOnInit(): void {
    if (this.size === 'small') {
      this.width = '34px';
      this.iconWidth = '12px';
    } else if (this.size === 'regular') {
      this.width = '40px';
      this.iconWidth = '15px';
    }
  }

}
