import {Component, Input, OnInit, Output, OnDestroy, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {interval, BehaviorSubject, Subject} from 'rxjs';
import { bumpIn } from '../animations';
import { PassLike } from '../models';
import { TimeService } from '../services/time.service';
import {getFormattedPassDate, getInnerPassContent, getInnerPassName, isBadgeVisible} from './pass-display-util';
import { DomSanitizer } from '@angular/platform-browser';
import { Request } from '../models/Request';
import { Invitation } from '../models/Invitation';
import {filter, takeUntil} from 'rxjs/operators';
import {ScreenService} from '../services/screen.service';

@Component({
  selector: 'app-pass-tile',
  templateUrl: './pass-tile.component.html',
  styleUrls: ['./pass-tile.component.scss'],
  animations: [
    bumpIn
  ]
})
export class PassTileComponent implements OnInit, OnDestroy {

  @Input() mock = null;
  @Input() pass: PassLike;
  @Input() fromPast = false;
  @Input() forFuture;
  @Input() isActive = false;
  @Input() forStaff = false;
  @Input() timerEvent: Subject<any>;

  @Output() tileSelected = new EventEmitter();

  buttonDown = false;
  timeLeft = '--:--';
  valid: boolean = true;
  hovered: boolean;
  timers: number[] = [];
  hoverDestroyer$: Subject<any>;

  activePassTime$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  get tileContent() {
    if (this.isActive) {
      return this.timeLeft + (this.valid ? ' Remaining' : ' Expiring');
    } else {
      return this.pass instanceof Request ?
          ((this.pass.request_time && this.forFuture) ?
            (!this.forStaff ? getInnerPassContent(this.pass) : getFormattedPassDate(this.pass)) : (this.forStaff ? 'Pass for Now' : '')) :
          getInnerPassContent(this.pass, (!this.pass['request_time'] && this.pass instanceof Request) ||
              !(this.pass instanceof Invitation));
    }
  }

  get tileName() {
    return getInnerPassName(this.pass);
  }

  get isBadgeVisible() {
    return isBadgeVisible(this.pass) && ((this.pass instanceof Invitation) && !this.forStaff) ||
        (this.pass instanceof Invitation && this.pass.status === 'declined') || (this.forStaff && this.pass instanceof Request);
  }

  get boxShadow() {
    if (!this.mock) {
        let i = 0;
        const hexColors = [];
        const rawHex = this.pass.color_profile.solid_color.slice(1);
        do {
            hexColors.push(rawHex.slice(i, i + 2));
            i += 2;
        } while (i < rawHex.length);
        const rgbString = hexColors.map(color => parseInt(color, 16)).join(', ');
        return this.sanitizer.bypassSecurityTrustStyle(this.hovered ?
            `0px 3px 10px rgba(${rgbString}, 0.3)` :
            this.buttonDown ? `0px 3px 5px rgba(${rgbString}, 0.15)` : '0px 3px 5px rgba(0, 0, 0, 0.1)');
    }
  }

  constructor(
    private sanitizer: DomSanitizer,
    private timeService: TimeService,
    private screenService: ScreenService
  ) {
  }

  ngOnInit() {
    this.valid = this.isActive;
    if (this.timerEvent) {
      this.timerEvent.pipe(filter(() => !!this.pass['expiration_time'])).subscribe(() => {
        const end: Date = this.pass['expiration_time'];
        const now: Date = this.timeService.nowDate();
        const diff: number = (end.getTime() - now.getTime()) / 1000;
        const mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
        const secs: number = Math.abs(Math.floor(diff) % 60);
        this.valid = end > now;
        this.activePassTime$.next(mins + ':' + (secs < 10 ? '0' + secs : secs));
        this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
      });
    }
  }

  ngOnDestroy() {
    this.timers.forEach(id => {
      clearInterval(id);
    });
    this.timers = [];
  }

  backgroundGradient() {
    if (this.buttonDown) {
      return this.pass.color_profile.pressed_color;
    } else {
      const gradient: string[] = this.pass.color_profile.gradient_color.split(',');
      return 'radial-gradient(circle at 73% 71%, ' + (gradient[0]) + ', ' + gradient[1] + ')';
    }
  }

  onPress(press: boolean, event) {
    if (this.screenService.isDeviceLargeExtra) event.preventDefault();
    this.buttonDown = press;
  }

  onTap(state: boolean) {
    this.buttonDown = state;
  }

  onClick(event) {
    this.tileSelected.emit(this.activePassTime$);
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

}
