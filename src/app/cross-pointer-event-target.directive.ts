import {Directive, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appCrossPointerEventTarget]'
})
export class CrossPointerEventTargetDirective {

  @Input() handler: Function;

  @HostListener(('ontouchend' in document.documentElement) ? 'touchend' : 'click', ['$event']) handleClick(evt) {
    this.handler(evt);
  }
  constructor() { }
}
