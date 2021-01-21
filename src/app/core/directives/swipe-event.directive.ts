import {Directive, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[appSwipeEvent]'
})
export class SwipeEventDirective {

  @Output() swipeLeft: EventEmitter<any> = new EventEmitter<any>();
  @Output() swipeRight: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }
  defaultTouch = { x: 0, y: 0, time: 0 };

  @HostListener('touchstart', ['$event'])
  //@HostListener('touchmove', ['$event'])
  @HostListener('touchend', ['$event'])
  @HostListener('touchcancel', ['$event'])
  handleTouch(event) {
    const touch = event.touches[0] || event.changedTouches[0];

    // check the events
    if (event.type === 'touchstart') {
      this.defaultTouch.x = touch.pageX;
      this.defaultTouch.y = touch.pageY;
      this.defaultTouch.time = event.timeStamp;
    } else if (event.type === 'touchend') {
      const deltaX = touch.pageX - this.defaultTouch.x;
      const deltaY = touch.pageY - this.defaultTouch.y;
      const deltaTime = event.timeStamp - this.defaultTouch.time;

      // simulte a swipe -> less than 500 ms and more than 60 px
      if (deltaTime < 500) {
        // touch movement lasted less than 500 ms
        if (Math.abs(deltaX) > 60) {
          // delta x is at least 60 pixels
          if (deltaX > 0) {
            this.doSwipeRight(event);
          } else {
            this.doSwipeLeft(event);
          }
        }

        if (Math.abs(deltaY) > 60) {
          // delta y is at least 60 pixels
          if (deltaY > 0) {
            this.doSwipeDown(event);
          } else {
            this.doSwipeUp(event);
          }
        }
      }
    }
  }

  doSwipeLeft(event) {
    console.log('swipe left', event);
    this.swipeLeft.emit(event);
  }

  doSwipeRight(event) {
    console.log('swipe right', event);
    this.swipeRight.emit(event);
  }

  doSwipeUp(event) {
    console.log('swipe up', event);
  }

  doSwipeDown(event) {
    console.log('swipe down', event);
  }

}
