import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {bumpIn} from '../../animations';

@Component({
  selector: 'app-white-round-button',
  templateUrl: './white-round-button.component.html',
  styleUrls: ['./white-round-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [bumpIn]
})
export class WhiteRoundButtonComponent implements OnInit {

  @Input() icon: string;
  @Input() size: 'regular' | 'small' = 'small';

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

  hovered: boolean;
  pressed: boolean;

  width: string;
  iconWidth: string;

  constructor() { }

  ngOnInit(): void {
    if (this.size === 'small') {
      this.width = '34px';
      this.iconWidth = '16px';
    } else if (this.size === 'regular') {
      this.width = '40px';
      this.iconWidth = '20px';
    }
  }

  get bg() {
    if (this.hovered) {
      if (this.pressed) {
        return '#EAEDF1';
      }
      return '#F0F2F5';
    }
    return '#FFFFFF';
  }

}
