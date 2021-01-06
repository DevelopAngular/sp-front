import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[appPassClick]'
})
export class PassClickDirective {

  @HostListener('click', ['$event'])
  onClick(event) {
  }

  constructor() {
  }

}
