import {Component, OnInit, Input, ViewChild, ElementRef, HostListener, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import {BehaviorSubject, fromEvent} from 'rxjs';
import {NextStep} from '../animations';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {SwiperConfigInterface} from 'ngx-swiper-wrapper';
import {ScreenService} from '../services/screen.service';
import {MobileDeviceService} from '../services/mobile-device.service';

export enum KEY_CODE {
    RIGHT_ARROW = 39,
    LEFT_ARROW = 37
}

@Component({
  selector: 'app-pager',
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.scss'],
  animations: [NextStep]
})
export class PagerComponent implements OnInit, AfterViewInit {

  @ViewChild('pageContent') pageContent: ElementRef;
  @ViewChild('left') left: ElementRef;

  @Input() page: number = 1;
  @Input() pages = 2;

  @Input() arrowPosition: string = '-27px';

  hideRightButton = new BehaviorSubject(false);
  hideLeftButton = new BehaviorSubject(true);
  frameMotion$: BehaviorSubject<any>;

  config: SwiperConfigInterface;

  swiperInitialized: boolean;

  @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent) {
      if (event.keyCode === KEY_CODE.LEFT_ARROW && this.hideLeftButton.value) {
        this.leftPaginator();
      } else if (event.keyCode === KEY_CODE.RIGHT_ARROW && this.hideRightButton.value) {
        this.RightPaginator();
      }
    }

  constructor(
    private formService: CreateFormService,
    private cdr: ChangeDetectorRef,
    public screenService: ScreenService,
    public mobileDevice: MobileDeviceService,
  ) {
    // console.log(this.page);
  }

  get $pages() {
    return Array(this.pages).fill(1).map((x, i) => (i + 1));
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();

    if (this.page === 1 && this.pages === 1) {
          this.hideLeftButton.next(false);
      }
      if (this.page === 1 && this.pages === 2) {
        this.hideLeftButton.next(false);
        this.hideRightButton.next(true);
      }

  }

  ngAfterViewInit(): void {
    this.config = {
      direction: 'horizontal',
      slidesPerView: 'auto',
    };
    this.cdr.detectChanges();
  }

  leftPaginator() {

    this.formService.setFrameMotionDirection('back');

    // setTimeout(() => {

      this.hideRightButton.next(true);
      if (this.page === 2) {
        this.hideLeftButton.next(false);
      }
      if (this.page >= 1) {
        this.page -= 1;
      }

    // }, 100);
  }

  RightPaginator() {
    this.formService.setFrameMotionDirection('forward');

    // setTimeout(() => {

      this.hideLeftButton.next(true);
      if (this.page === 1 && this.pages === 2
        || this.page === 2 && this.pages === 3
        || this.page === 3 && this.pages === 4) {
        this.hideRightButton.next(false);
      }
      this.page += 1;
    //
    // }, 100);


  }
  DotPagination(dot) {
    if (dot > this.page) {
      this.formService.setFrameMotionDirection('forward');
    } else {
      this.formService.setFrameMotionDirection('back');
    }

    setTimeout(() => {
      this.page = dot;
      if (dot === 1) {
        this.hideLeftButton.next(false);
        this.hideRightButton.next(true);
      }
      if (dot > 1 && dot < this.$pages.length + 1) {
        this.hideLeftButton.next(true);
        this.hideRightButton.next(true);
      }
      if (dot === this.$pages.length) {
        this.hideLeftButton.next(true);
        this.hideRightButton.next(false);
      }
    }, 100);

  }

  onSlideChange(event) {
    this.page = event + 1;
  }

  swiperInit($event: any) {
    this.swiperInitialized = true;
  }
}
