import {AfterViewInit, Directive, ElementRef, OnInit} from '@angular/core';
import {DomCheckerService} from '../../services/dom-checker.service';

@Directive({
  selector: '[appDomElementChecker]'
})
export class DomElementCheckerDirective implements OnInit, AfterViewInit {


  constructor(private el: ElementRef<HTMLElement>,
              private  domChecker: DomCheckerService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    // debugger
    this.domChecker.domElement$.next(this.el);
  }
}
