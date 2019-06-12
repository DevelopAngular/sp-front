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
  @Output() clickEvent: EventEmitter<boolean> = new EventEmitter();

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
    } else {
      if (this.pressed) {
        lightFill = 'Jade';
      } else {
        lightFill = 'Blue-Gray';
      }

    }

    // if (this.srcString) {
      return this.darkTheme.getIcon({
        iconName: this.srcString,
        darkFill: 'White',
        lightFill: lightFill
      });
    // } else {
    //   return '';
    // }
  }

  get bgc() {
    return this.sanitizer.bypassSecurityTrustStyle('rgba(244, 244, 244,' + (this.down ? '1' : ' .7)'));
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
  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }
}
