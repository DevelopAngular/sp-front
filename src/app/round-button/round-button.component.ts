import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {bumpIn} from '../animations';

@Component({
  selector: 'app-round-button',
  templateUrl: './round-button.component.html',
  styleUrls: ['./round-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    bumpIn,
  ]
})
export class RoundButtonComponent implements OnInit {

  @Input() icon: string;
  @Input() size: number = 44;
  @Input() backgroundColor: string = '#FFFFFF';
  @Input() iconWidth: number = 20;

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

  pressed: boolean;
  hovered: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
