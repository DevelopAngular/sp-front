import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {bumpIn} from '../animations';
import _refiner from 'refiner-js';

@Component({
  selector: 'app-feedback-button',
  templateUrl: './feedback-button.component.html',
  styleUrls: ['./feedback-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [bumpIn]
})
export class FeedbackButtonComponent implements OnInit {

  @Input() buttonColor: string = '#FFFFFF';

  hovered: boolean;
  pressed: boolean;

  constructor(
  ) { }

  get bg() {
    if (this.hovered) {
      if (this.pressed) {
        return '#E2E6EC';
      }
      return '#EAEDF1';
    }
    return '#F0F2F5';
  }

  ngOnInit(): void {
  }

  openWindow() {
    _refiner('showForm', '31b6c030-820a-11ec-9c99-8b41a98d875d', true);
  }

}
