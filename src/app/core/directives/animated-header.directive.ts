import {AfterViewInit, ChangeDetectorRef, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {NavbarElementsRefsService} from '../../services/navbar-elements-refs.service';
import {BehaviorSubject, combineLatest, forkJoin, merge, of, Subject, zip} from 'rxjs';
import {filter, switchMap, takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[appAnimatedHeader]'
})
export class AnimatedHeaderDirective implements AfterViewInit, OnInit, OnDestroy {
  constructor(
              private cdr: ChangeDetectorRef,
              private animatedHeader: ElementRef,
              private navbarElementsService: NavbarElementsRefsService,
              private renderer: Renderer2) { }

  navbarRef: ElementRef<HTMLElement>;

  toggleSchoolBarRef: ElementRef<HTMLElement>;

  stopPoint: number;

  fontSize: number;

  @Input() hasScroll: BehaviorSubject<boolean>;

  @Input() user;

  @Input() topPosition = 100;

  private subscriber$ = new Subject();

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    console.log(this.animatedHeader);
    zip(
      this.navbarElementsService.navbarElement.pipe(filter(res => !!res)),
      this.navbarElementsService.schoolToggle.pipe(filter(res => !!res))
    )
      .pipe(
        takeUntil(this.subscriber$)
      )
      .subscribe(([navbar, toggle]) => {
        // console.log(toggle);
        this.initializeAnimatedHedaer(navbar, toggle);
      });

    if (!this.navbarElementsService.schoolToggle$.value) {
      this.navbarElementsService.navbarElement.pipe(takeUntil(this.subscriber$),
        filter(res => !!res)).subscribe( (navbar) => {
        this.initializeAnimatedHedaer(navbar);
      });
    }
  }

  ngOnDestroy() {
    this.subscriber$.next(null);
    this.subscriber$.complete();
  }

  getsStopPoint() {
    return this.toggleSchoolBarRef ? this.getHalfHeaderPos() + this.toggleSchoolBarRef.nativeElement.getBoundingClientRect().height : this.getHalfHeaderPos();
  }

  getHalfHeaderPos() {
    console.log(this.navbarRef.nativeElement.offsetHeight);
    console.log(this.navbarRef);
    return  (this.navbarRef.nativeElement.offsetHeight - this.animatedHeader.nativeElement.getBoundingClientRect().height) / 2;
  }

  initializeAnimatedHedaer(navbar: ElementRef<HTMLElement>, toggle: ElementRef<HTMLElement> = null ) {
    this.navbarRef = navbar;
    if (toggle) {
      this.toggleSchoolBarRef = toggle;
    }
    this.stopPoint = this.getsStopPoint();
    this.renderer.setStyle(this.animatedHeader.nativeElement, 'top' , `${this.headerTopPos}px`);
    this.fontSize = parseFloat(this.fontSizeStyle);
    this.animateHeader();
  }

  @HostListener('window:scroll')
  animateHeader() {
    console.log(this.animatedHeader.nativeElement);
    if (document.documentElement.offsetHeight > document.documentElement.scrollHeight || document.body.offsetHeight > document.body.scrollHeight) {
      return;
    }

    const fontScale = Math.max(this.fontSize - 10, this.fontSize - 0.1 * this.scrollY);
    const logoHeight = Math.min(this.topPosition, this.topPosition - this.scrollY <= this.stopPoint ? this.stopPoint : this.topPosition - this.scrollY);

    this.renderer.setStyle(this.animatedHeader.nativeElement, 'top', `${logoHeight}px`);
    this.renderer.setStyle(this.animatedHeader.nativeElement, 'font-size', `${fontScale + 'px'}`);
  }

  get scrollY() {
    return window.pageYOffset || document.documentElement.scrollTop;
  }

  get headerTopPos() {
    if(this.toggleSchoolBarRef) {
      return this.user.isAdmin() ? this.topPosition = this.topPosition + this.toggleSchoolBarRef.nativeElement.getBoundingClientRect().height : this.topPosition;
    }
    return;
  }

  get fontSizeStyle() {
    return window.getComputedStyle(this.animatedHeader.nativeElement, null).getPropertyValue('font-size');
  }
}
