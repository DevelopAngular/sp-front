import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {BehaviorSubject, interval, Observable, Subject} from 'rxjs';
import {bumpIn, studentPassFadeInOut} from '../animations';
import {PassLike} from '../models';
import {TimeService} from '../services/time.service';
import {getFormattedPassDate, getInnerPassContent, getInnerPassName, isBadgeVisible} from './pass-display-util';
import {DomSanitizer} from '@angular/platform-browser';
import {Request} from '../models/Request';
import {Invitation} from '../models/Invitation';
import {filter, take, takeUntil} from 'rxjs/operators';
import {ConnectedPosition, Overlay} from '@angular/cdk/overlay';
import {DomCheckerService} from '../services/dom-checker.service';
import {KioskModeService} from '../services/kiosk-mode.service';

@Component({
  selector: 'app-pass-tile',
  templateUrl: './pass-tile.component.html',
  styleUrls: ['./pass-tile.component.scss'],
  animations: [
    bumpIn,
    studentPassFadeInOut
  ]
})
export class PassTileComponent implements OnInit, OnDestroy, OnChanges {

  @Input() mock = null;
  @Input() pass: PassLike;
  @Input() fromPast = false;
  @Input() forFuture: boolean;
  // just presents a less "active" version of pass tile
  @Input() presentational: boolean;
  @Input() isActive = false;
  @Input() forStaff = false;
  @Input() timerEvent: Subject<any>;
  @Input() allowPopup: boolean;
  @Input() profileImage: boolean;
  @Input() isEnableProfilePictures: boolean;
  @Input() isMiniCard: boolean;
  @Input() encounterPreventionCard: boolean;

  @Output() tileSelected = new EventEmitter<{time$: Observable<any>, pass: any}>();

  @ViewChild('studentPasses') studentPasses: ElementRef;
  @ViewChild('avatar') avatar: ElementRef;

  buttonDown = false;
  timeLeft = '--:--';
  valid: boolean = true;
  hovered: boolean;
  timers: number[] = [];
  hoverDestroyer$: Subject<any>;
  isOpenTooltip: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showBackgroundOverlay: boolean;
  destroyAnimation$: Subject<any> = new Subject<any>();
  destroyOpen$ = new Subject();
  disableClose$ = new Subject();
  loadingAvatar: boolean;

  activePassTime$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  overlayPositions: ConnectedPosition[];
  scrollStrategy;
  destroyCloseQuickPreview: boolean = false;

  destroy$: Subject<any> = new Subject<any>();

  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  get tileContent() {
    if (this.isActive) {
      return this.timeLeft + (this.valid ? ' Remaining' : ' Expiring');
    } else {
      if (this.encounterPreventionCard) {
        return 'Now';
      }
      const content = this.pass instanceof Request ?
          ((this.pass.request_time && this.forFuture) ?
            (!this.forStaff ? getInnerPassContent(this.pass) : this.sanitizer.bypassSecurityTrustHtml(getFormattedPassDate(this.pass))) : (this.forStaff ? 'Pass for Now' : '')) :
          getInnerPassContent(this.pass, (!this.pass['request_time'] && this.pass instanceof Request) ||
              !(this.pass instanceof Invitation));
     return content;
    }
  }

  get tileName() {
    return getInnerPassName(this.pass);
  }

  get isBadgeVisible() {
    if (this.encounterPreventionCard) {
      return false;
    }

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

  get isKioskMode() {
    return !!this.kioskMode.getCurrentRoom().getValue();
  }

  constructor(
    private sanitizer: DomSanitizer,
    private timeService: TimeService,
    public overlay: Overlay,
    private renderer: Renderer2,
    private domCheckerService: DomCheckerService,
    private kioskMode: KioskModeService
  ) {
  }

  ngOnInit() {
    this.valid = this.isActive;
    this.scrollStrategy = this.overlay.scrollStrategies.block();
    if (this.timerEvent) {
      this.timerEvent.pipe(
        filter(() => !!this.pass['expiration_time']),
        takeUntil(this.destroy$)
      ).subscribe(() => {
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.profileImage) {
      const bigCard = changes.profileImage.currentValue;
      this.overlayPositions = [
        {
          panelClass: 'student-panel1',
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: -71,
          offsetY: bigCard ? 175 : 88
        },
        {
          panelClass: 'student-panel2',
          originX: 'start',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
          offsetX: 72,
          offsetY: bigCard ? 175 : 88
        },
        {
          panelClass: 'student-panel3',
          originX: 'start',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'bottom',
          offsetX: 72,
          offsetY: bigCard ? 142 : 55
        },
        {
          panelClass: 'student-panel4',
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetX: -71,
          offsetY: bigCard ? 142 : 55
        }
      ];
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  backgroundGradient() {
    if (this.buttonDown) {
      return this.pass.color_profile.pressed_color;
    } else {
      const gradient: string[] = this.pass.color_profile.gradient_color.split(',');
      return 'radial-gradient(circle at 73% 71%, ' + (gradient[0]) + ', ' + gradient[1] + ')';
    }
  }

  onClick(event) {
    if (this.presentational) return;

    this.tileSelected.emit({time$: this.activePassTime$, pass: this.pass});
  }

  onHover(evt: Event, container: HTMLElement) {
    if (this.presentational) return;

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
    if (this.presentational) return;

    target.style.marginLeft = '0px';
    target.style.transition = `margin-left .4s ease`;
    target.style.width = `100%`;

    this.hoverDestroyer$.next();
    this.hoverDestroyer$.complete();
  }

  setAnimationTrigger(value) {
    if (this.presentational) return;

    if (!this.showBackgroundOverlay && !this.destroyCloseQuickPreview) {
      interval(200).pipe(take(1), takeUntil(this.destroyAnimation$)).subscribe(() => {
        this.domCheckerService.fadeInOutTrigger$.next(value);
      });
    }
  }

  studentNameOver() {
    if (this.presentational) return;

    if (this.allowPopup && !this.isKioskMode) {
      this.disableClose$.next();
      this.setAnimationTrigger('fadeIn');
      interval(500).pipe(take(1), takeUntil(this.destroyOpen$)).subscribe(() => {
        this.isOpenTooltip.next(true);
      });
    }
  }

  studentNameLeave() {
    if (this.presentational) return;

    // console.log('CLOSE ==>>>', this.destroyCloseQuickPreview);
    if (this.allowPopup && !this.isKioskMode && !this.destroyCloseQuickPreview) {
      this.destroyOpen$.next();
      interval(300).pipe(take(1), takeUntil(this.disableClose$)).subscribe(() => {
        this.isOpenTooltip.next(false);
      });
    }
  }

  updateOverlayPosition(event) {
    if (this.presentational) return;

    this.renderer.addClass(this.studentPasses.nativeElement, event.connectionPair.panelClass);
  }

  overlayLeave() {
    if (this.presentational) return;

    this.showBackgroundOverlay = false;
    this.destroyOpen$.next();
  }
}
