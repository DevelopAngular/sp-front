import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss']
})
export class IconButtonComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('iconButtonRef') iconButtonRef: ElementRef;

  @Input() size: number = 25;
  @Input() onDarkShade: boolean = false;
  @Input() srcString: string = '';
  @Input() pressed: boolean = false;
  @Input() switchColor: boolean = true;
  @Input() eventBubbling = false;
  @Input() blueWhite: boolean;
  @Input() hasShadow: boolean = true;
  @Output() clickEvent: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  hovered: boolean = false;
  down: boolean = false;

  private destroyer$: Subject<any> = new Subject();

  constructor(
    private darkTheme: DarkThemeSwitch,
    private sanitizer: DomSanitizer
  ) { }

  get src() {
    let lightFill;

    if (this.onDarkShade) {
      lightFill = 'White';
    } else if (this.blueWhite) {
      lightFill = 'Blue-White';
    } else {
      if (this.pressed && this.switchColor) {
        lightFill = 'Jade';
      } else {
        lightFill = 'Blue-Gray';
      }

    }

    return this.darkTheme.getIcon({
      iconName: this.srcString,
      darkFill: 'White',
      lightFill: lightFill
    });
  }

  get opacity() {
    let opacity;
    if (this.onDarkShade) {
      if (this.hovered || this.pressed) {
        opacity = '.8';
      } else {
        opacity = '1';
      }
    } else {
      if (this.hovered && !this.down) {
        opacity = '.8';
      } else {
        opacity = '1';
      }
    }
    return this.sanitizer.bypassSecurityTrustStyle(`${opacity}`);
  }

  get bgc() {
    let alphaChannel: number;
    let rgb: string;
    if (this.onDarkShade) {
      alphaChannel = .5;
      if (this.hovered && !this.down) {
        alphaChannel = .5;
      } else {
        alphaChannel = .25;
      }
      rgb = '247, 247, 247, ';

    } else {

      if (this.hovered && !this.down) {
        alphaChannel = .75;
      } else {
        alphaChannel = .5;
      }
      rgb = '244, 244, 244, ';

    }
    return this.sanitizer.bypassSecurityTrustStyle(`rgba(${rgb}${ this.hasShadow ? alphaChannel : 0 }`);
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    fromEvent(document.body, 'click')
      .pipe(
        takeUntil(this.destroyer$)
      )
      .subscribe((evt: Event) => {
        if (this.pressed) {
          this.pressed = false;
        }
      });
  }

  onClick(evt) {
    this.pressed = !this.pressed;
    if (!this.eventBubbling) {
      evt.stopPropagation();
    }
    this.clickEvent.emit(evt);
  }

  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }
}
