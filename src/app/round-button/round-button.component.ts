import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {bumpIn} from '../animations';
import {Subject} from 'rxjs';

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
  @Input() width: number = 44;
  @Input() iconOffset: number = 0;
  @Input() backgroundColor: string = '#FFFFFF';
  @Input() iconWidth: number = 20;
  @Input() size: 'regular' | 'small' = 'regular';

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

  pressed: boolean;
  hovered: boolean;
  selected: boolean;

  destroy$: Subject<any> = new Subject<any>();

  constructor() { }

  ngOnInit(): void {
    if (this.size === 'regular') {
      this.width = 40;
    } else if (this.size === 'small') {
      this.width = 34;
    }
    // fromEvent(document.body, 'click').pipe(delay(200), filter(() => !!this.selected)).subscribe(() => {
    //   this.hovered = false;
    //   this.selected = false;
    // });
  }

  getBackground(): string {
    if (this.hovered) {
      if (this.pressed) {
        if (this.selected) {
          return '#C6ECDF';
        }
        return '#EAEDF1';
      }
      if (this.selected) {
        return '#D9F4EB';
      }
      return '#F0F2F5';
    }
    if (this.selected) {
      return '#E5F7F1';
    }
    return '#FFFFFF';
  }

}
