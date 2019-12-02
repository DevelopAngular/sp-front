import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';

@Directive({
  selector: '[appCrossPointerEventTarget]'
})
export class CrossPointerEventTargetDirective {

  @Output() pointerDownEvent: EventEmitter<any> = new EventEmitter();
  @Output() pointerClickEvent: EventEmitter<any> = new EventEmitter();

  @HostListener(('ontouchend' in document.documentElement) ? 'touchend' : 'click', ['$event']) handleClick(evt) {

    switch (evt.type) {

      case 'touchend':
        const rect = evt.target.getBoundingClientRect();
        const singleTouch = evt.changedTouches[0];
        const allowTouch = {
          x: singleTouch.clientX >= rect.left && singleTouch.clientX <= rect.right,
          y: singleTouch.clientY >= rect.top && singleTouch.clientY <= rect.bottom,
        };
        console.log(rect, singleTouch);
        console.log(allowTouch);
        if (Object.values(allowTouch).every(v => !!v)) {
          this.pointerClickEvent.emit(evt as TouchEvent);
        }
        break;

      case 'click':
        this.pointerClickEvent.emit(evt as MouseEvent);
        break;

    }

  }

  @HostListener(('ontouchstart' in document.documentElement) ? 'ontouchstart' : 'mousedown', ['$event']) handleDown(evt) {

    switch (evt.type) {

      case 'touchstart':
        // const rect = evt.target.getBoundingClientRect();
        // const singleTouch = evt.changedTouches[0];
        // const allowTouch = {
        //   x: singleTouch.clientX >= rect.left && singleTouch.clientX <= rect.right,
        //   y: singleTouch.clientY >= rect.top && singleTouch.clientX <= rect.bottom,
        // };
        //
        // if (Object.values(allowTouch).every(v => !!v)) {
        // }
        this.pointerDownEvent.emit(evt as TouchEvent);
        break;

      case 'mousedown':
        this.pointerDownEvent.emit(evt as MouseEvent);
        break;

    }

  }

  constructor() { }
}
