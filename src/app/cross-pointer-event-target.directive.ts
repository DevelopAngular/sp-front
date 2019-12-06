import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';

@Directive({
  selector: '[appCrossPointerEventTarget]'
})
export class CrossPointerEventTargetDirective {

  @Output() pointerDownEvent: EventEmitter<MouseEvent | TouchEvent> = new EventEmitter();
  @Output() pointerClickEvent: EventEmitter<MouseEvent | TouchEvent> = new EventEmitter();
  @Output() pointerCancelEvent: EventEmitter<null> = new EventEmitter();

  @HostListener(('ontouchend' in document.documentElement) ? 'touchend' : 'click', ['$event']) handleClick(evt) {

    switch (evt.type) {

      case 'touchend':

        evt.preventDefault();
        const rect = evt.target.getBoundingClientRect();
        const singleTouch = evt.changedTouches[0];
        const allowTouch = {
          x: singleTouch.clientX >= rect.left && singleTouch.clientX <= rect.right,
          y: singleTouch.clientY >= rect.top && singleTouch.clientY <= rect.bottom,
        };
        // console.log(rect, singleTouch);
        // console.log(allowTouch);

        if (Object.values(allowTouch).every(v => !!v)) {
          this.pointerClickEvent.emit(evt as TouchEvent);
        } else {
          this.pointerCancelEvent.emit(null);
        }

        break;

      case 'click':
        this.pointerClickEvent.emit(evt as MouseEvent);
        break;

    }

  }

  @HostListener(('ontouchstart' in document.documentElement) ? 'touchstart' : 'mousedown', ['$event']) handleDown(evt) {
    switch (evt.type) {

      case 'touchstart':
        this.pointerDownEvent.emit(evt as TouchEvent);
        break;

      case 'mousedown':
        this.pointerDownEvent.emit(evt as MouseEvent);
        break;

    }

  }

  constructor() { }
}
