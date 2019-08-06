import {Directive, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {interval, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {ScrollPositionService} from './scroll-position.service';

@Directive({
  selector: '[appScrollHolder]'
})
export class ScrollHolderDirective implements OnInit, OnDestroy {
  @Input() scrollableAreaName: string;
  private scrollableArea: HTMLElement;
  constructor(
    private elemRef: ElementRef,
    private scrollPosition: ScrollPositionService
  ) { }
  ngOnInit(): void {
    console.log(this.elemRef.nativeElement, this.scrollableAreaName);

      this.scrollableArea = this.elemRef.nativeElement;
      const scrollObserver = new Subject();
      const initialHeight = this.scrollableArea.scrollHeight;
      const scrollOffset = this.scrollPosition.getComponentScroll(this.scrollableAreaName);

      /**
       * If the scrollable area has static height, call `scrollTo` immediately,
       * otherwise additional subscription will perform once if the height changes
       */

      if (scrollOffset) {
        this.scrollableArea.scrollTo({top: scrollOffset});
      }

      interval(50)
        .pipe(
          filter(() => {
            return initialHeight < this.scrollableArea.scrollHeight && scrollOffset;
          }),
          takeUntil(scrollObserver)
        )
        .subscribe((v) => {
          console.log(scrollOffset);
          if (v) {
            this.scrollableArea.scrollTo({top: scrollOffset});
            scrollObserver.next();
            scrollObserver.complete();
          }
        });
  }
  ngOnDestroy(): void {
    this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
  }
}
