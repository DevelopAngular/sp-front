import {AfterViewInit, Directive, ElementRef, OnInit} from '@angular/core';
import {NavbarElementsRefsService} from '../../services/navbar-elements-refs.service';

@Directive({
  selector: '[appNavbarElementSender]'
})
export class NavbarElementSenderDirective implements OnInit, AfterViewInit {

  constructor(private element: ElementRef<HTMLElement>,
              private navbarElementRefService: NavbarElementsRefsService) {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.navbarElementRefService.navbarRef$.next(this.element);
  }
}
