import {Directive, ElementRef, EventEmitter, OnInit, Output, Renderer2} from '@angular/core';
import {fromEvent} from 'rxjs';

@Directive({
  selector: '[appCheckUserInput]'
})
export class CheckUserInputDirective implements OnInit {

  @Output() inputValueEmit: EventEmitter<string> = new EventEmitter<string>();

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
      .subscribe((value: any) => {
        this.inputValueEmit.emit(value.currentTarget.value);
      });
  }

}
