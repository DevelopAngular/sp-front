import {AfterViewInit, ChangeDetectorRef, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {NavbarElementsRefsService} from '../../services/navbar-elements-refs.service';
import {BehaviorSubject, combineLatest, iif, of, Subject} from 'rxjs';
import {filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {HttpService} from '../../services/http-service';
import {DeviceDetection} from '../../device-detection.helper';

@Directive({
  selector: '[appAnimatedHeader]'
})
export class AnimatedHeaderDirective implements AfterViewInit, OnInit, OnDestroy {
  constructor(
              private cdr: ChangeDetectorRef,
              private animatedHeader: ElementRef,
              private navbarElementsService: NavbarElementsRefsService,
              private renderer: Renderer2,
              private http: HttpService) { }

  navbarRef: ElementRef<HTMLElement>;

  toggleSchoolBarRef: ElementRef<HTMLElement>;

  stopPoint: number;

  fontSize: number;

  @Input() topPosition = 100;

  private subscriber$ = new Subject();

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    combineLatest(
      [
        this.navbarElementsService.navbarRef$,
        this.http.schoolsLength$.pipe(filter(res => !!res), switchMap(schoolsLength => {
          return iif(() => schoolsLength > 1, this.navbarElementsService.schoolToggle$, of(null));
        }))
      ]
    ).pipe(
        takeUntil(this.subscriber$)
      )
      .subscribe(([navbar, schoolToggleBar]) => {
          if (navbar.nativeElement.getBoundingClientRect().height > 0) {
            this.initializeAnimatedHedaer(navbar, schoolToggleBar);
          }
      });
  }

  ngOnDestroy() {
    this.subscriber$.next(null);
    this.subscriber$.complete();
  }

  getsStopPoint() {
    return this.toggleSchoolBarRef ? this.getHalfHeaderPos() + this.toggleSchoolBarRef.nativeElement.getBoundingClientRect().height : this.getHalfHeaderPos();
  }

  getHalfHeaderPos() {
    return  (this.navbarRef.nativeElement.offsetHeight - this.animatedHeader.nativeElement.getBoundingClientRect().height) / 2;
  }

  initializeAnimatedHedaer(navbar: ElementRef<HTMLElement>, toggle: ElementRef<HTMLElement> = null ) {
    if (navbar) {
      this.navbarRef = navbar;
    }
    if (toggle) {
      this.toggleSchoolBarRef = toggle;
    }
    this.stopPoint = this.getsStopPoint();
    this.renderer.setStyle(this.animatedHeader.nativeElement, 'top' , `${this.headerTopPos}px`);
    this.fontSize = parseFloat(this.fontSizeStyle);

    if (this.isAndroid) {
      this.disableAnimationForAndroid();
      return;
    }

    this.animateHeader();
  }

  @HostListener('window:scroll', ['$event'])
  animateHeader(event = null) {

    if (document.documentElement.offsetHeight > document.documentElement.scrollHeight ||
      document.body.offsetHeight > document.body.scrollHeight || event && this.isAndroid) {
      return;
    }

    const fontScale = Math.max(this.fontSize - 10, this.fontSize - 0.1 * this.scrollY);
    const logoHeight = Math.min(this.topPosition, this.topPosition - this.scrollY <= this.stopPoint ? this.stopPoint : this.topPosition - this.scrollY);

    this.renderer.setStyle(this.animatedHeader.nativeElement, 'top', `${logoHeight}px`);
    this.renderer.setStyle(this.animatedHeader.nativeElement, 'font-size', `${fontScale + 'px'}`);
  }

  disableAnimationForAndroid() {
      const fontScale = this.fontSize - 10;
      const logoHeight = this.stopPoint;

      this.renderer.setStyle(this.animatedHeader.nativeElement, 'top', `${logoHeight}px`);
      this.renderer.setStyle(this.animatedHeader.nativeElement, 'font-size', `${fontScale + 'px'}`);
  }

  get scrollY() {
    return window.pageYOffset || document.documentElement.scrollTop;
  }

  get headerTopPos() {
    return this.toggleSchoolBarRef ? this.topPosition = this.topPosition + this.toggleSchoolBarRef.nativeElement.getBoundingClientRect().height : this.topPosition;
  }

  get fontSizeStyle() {
    return window.getComputedStyle(this.animatedHeader.nativeElement, null).getPropertyValue('font-size');
  }

  get isAndroid() {
    return DeviceDetection.isAndroid();
  }
}
