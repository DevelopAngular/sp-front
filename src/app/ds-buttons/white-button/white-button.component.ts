import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {bumpIn} from '../../animations';

@Component({
  selector: 'app-white-button',
  templateUrl: './white-button.component.html',
  styleUrls: ['./white-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [bumpIn]
})
export class WhiteButtonComponent implements OnInit {

  @Input() text: string;
  @Input() icon: string;
  @Input() width: string;
  @Input() height: string;
  @Input() iconWidth: string;
  @Input() rightIcon: string;
  @Input() rightIconWidth: string;
  @Input() fontWeight: string = 'Normal';

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

  hover: boolean;
  pressed: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  bgColor() {
    if (this.hover) {
      if (this.pressed) {
        return '#EAEDF1';
      }
      return '#F0F2F5';
    }
    return '#FFFFFF';
  }

}
