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
  @Input() width: string = '34px';

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

  hovered: boolean;
  pressed: boolean;

  constructor() { }

  ngOnInit(): void {
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
