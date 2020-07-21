import {Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[appCheckUserInput]'
})
export class CheckUserInputDirective implements OnInit, OnDestroy {

  @Output() inputValueEmit: EventEmitter<string> = new EventEmitter<string>();

  destroy$ = new Subject();

  constructor(
    private element: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    const newInput = this.renderer.createElement('input');
    newInput.focus();
    this.renderer.setStyle(newInput, 'opacity', 0);
    this.renderer.setStyle(newInput, 'position', 'absolute');
    this.renderer.setStyle(newInput, 'width', 0);
    this.renderer.setStyle(newInput, 'top', '-1000000px');
    this.renderer.appendChild(this.element.nativeElement, newInput);
    fromEvent(newInput, 'keyup')
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: any) => {
        this.inputValueEmit.emit(value.currentTarget.value);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
