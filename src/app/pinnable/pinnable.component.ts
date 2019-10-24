import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output, SimpleChanges
} from '@angular/core';
import { bumpIn } from '../animations';
import { Pinnable } from '../models/Pinnable';
import { DomSanitizer } from '@angular/platform-browser';
import {interval, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-pinnable',
  templateUrl: './pinnable.component.html',
  styleUrls: ['./pinnable.component.scss'],
  animations: [
    bumpIn
  ]
})
export class PinnableComponent implements OnInit, OnChanges {

  @Input() mock = null;

  @Input()
  pinnable: Pinnable;

  @Input()
  width: string = '120px';

  @Input()
  height: string = '70px';

  @Input()
  iconWidth: string = '30px';

  @Input()
  forLater: boolean = false;

  @Input()
  forStaff: boolean = false;

  @Input()
  forCollection: boolean = false;

  @Input()
  forBulk: boolean = false;

  @Input()
  valid: boolean = true;

  @Input()
  selected: boolean = false;

  @Input() disabled: boolean = false;

  @Output()
  onSelectEvent: EventEmitter<Pinnable> = new EventEmitter();

  @Output() clampedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  restricted: boolean = false;
  buttonDown = false;
  hovered: boolean;
  intervalId;

  hoverDestroyer$: Subject<any>;

  constructor(
    private sanitizer: DomSanitizer,
    private changeDetector: ChangeDetectorRef
  ) {

  }

  get shadow() {

    let i = 0;
    const hexColors = [];
    const rawHex = this.mock ? this.mock.solid.slice(1) : this.pinnable.color_profile.solid_color.slice(1);
    do {
      hexColors.push(rawHex.slice(i, i + 2));
      i += 2;
    } while (i < rawHex.length);
    const rgbString = hexColors.map(color => parseInt(color, 16)).join(', ');

    if (this.hovered && this.valid && !this.disabled) {
      return this.sanitizer.bypassSecurityTrustStyle(`0px 3px 10px rgba(${rgbString}, 0.2)`);
    } else {
      return this.sanitizer.bypassSecurityTrustStyle(' 0px 3px 5px rgba(0, 0, 0, 0.1)');
    }
  }

  ngOnInit() {

    if (!this.mock) {
      if (!!this.pinnable.location) {
        this.restricted = ((this.pinnable.location.restricted && !this.forLater) || (this.pinnable.location.scheduling_restricted && this.forLater));
      }

    } else {

    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.changeDetector.detectChanges();
  }

  get buttonState() {
    return this.valid && !this.disabled ? this.buttonDown ? 'down' : 'up' : 'up';
  }

  onHover(evt: Event, container: HTMLElement) {
    this.hoverDestroyer$ = new Subject<any>();
    const target = (evt.target as HTMLElement);
    target.style.width = `auto`;
    target.style.transition = `none`;

    const targetWidth = target.getBoundingClientRect().width;
    const containerWidth = container.getBoundingClientRect().width;

    let margin = 0;
    interval(35)
      .pipe(
        takeUntil(this.hoverDestroyer$)
      )
      .subscribe(() => {
        if ((targetWidth - margin) > containerWidth) {
          target.style.marginLeft = `-${margin}px`;
          margin++;
        }
      });
  }

  onLeave({target: target}) {
    target.style.marginLeft = '0px';
    target.style.transition = `margin-left .4s ease`;
    target.style.width = `100%`;

    this.hoverDestroyer$.next();
    this.hoverDestroyer$.complete();
  }

  onSelect() {
    if (this.valid && !this.disabled)
      this.onSelectEvent.emit(this.pinnable);
  }

  getGradient() {
    if (this.buttonDown) {
      if (this.pinnable.color_profile.pressed_color) {
        return this.pinnable.color_profile.pressed_color;
      } else {
        return this.pinnable.color_profile.gradient_color.split(',')[0];
      }
    } else {
      const gradient: string[] = this.pinnable.color_profile.gradient_color.split(',');
      return this.sanitizer.bypassSecurityTrustStyle('radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')');
    }
  }

  onPress(press: boolean) {
    if (!this.disabled) {
      this.buttonDown = press;
      let count = 100;
      if (press) {
        this.intervalId = setInterval(() => {
          if (count <= 1000) {
              count += 100;
          } else {
            this.clampedEvent.emit(true);
            clearInterval(this.intervalId);
          }
        }, 100);
      } else {
        clearInterval(this.intervalId);
      }
    }
  }

}
