import {Directive, ElementRef, EventEmitter, OnInit, Output, Renderer2} from '@angular/core';

@Directive({
  selector: '[appCrossPointerEventTarget]'
})
export class CrossPointerEventTargetDirective implements OnInit {

  @Output() pointerDownEvent: EventEmitter<MouseEvent | TouchEvent> = new EventEmitter();
  @Output() pointerClickEvent: EventEmitter<MouseEvent | TouchEvent> = new EventEmitter();
  @Output() pointerCancelEvent: EventEmitter<null> = new EventEmitter();

  constructor(
    private elementRef: ElementRef<any>,
    private renderer2: Renderer2
  ) {}

  ngOnInit(): void {

    const target = this.elementRef.nativeElement as HTMLElement;

    if ('ontouchend' in document.documentElement) {
      this.renderer2.listen(target, 'touchend', (evt: TouchEvent) => {
        console.log('touchend', evt);
        const rect = target.getBoundingClientRect();
        const singleTouch = evt.changedTouches[0];
        const allowTouch = {
          x: singleTouch.clientX >= rect.left && singleTouch.clientX <= rect.right,
          y: singleTouch.clientY >= rect.top && singleTouch.clientY <= rect.bottom,
        };
        if (Object.values(allowTouch).every(v => !!v)) {
          this.pointerClickEvent.emit(evt);
        } else {
          this.pointerCancelEvent.emit(null);
        }
      });
    } else {
      this.renderer2.listen(target, 'click', (evt:  MouseEvent) => {
        console.log('mouseup=>click', evt);
        this.pointerClickEvent.emit(evt);
      });
    }

    if ('ontouchstart' in document.documentElement) {
      this.renderer2.listen(target, 'touchstart', (evt: TouchEvent) => {
        console.log('touchstart', evt);
        this.pointerDownEvent.emit(evt as TouchEvent);
      });
    } else {
      this.renderer2.listen(target, 'mousedown', (evt:  MouseEvent) => {
        console.log('mousedown', evt);
        this.pointerDownEvent.emit(evt);
      });
    }
  }

}
