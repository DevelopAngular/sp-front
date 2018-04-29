import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {trigger, state, style, transition, animate} from '@angular/animations';

@Component({
  selector: 'app-demo-nav',
  templateUrl: './demo-nav.component.html',
  styleUrls: ['./demo-nav.component.css'],
  animations: [
    trigger('toggleState', [
      state('show', style({
        transform: 'translateX(20em)'
      })),
      state('hide', style({
        transform: 'translateX(0px)'
      })),
      transition('show => hide', animate('300ms ease-in')),
      transition('hide => show', animate('300ms ease-out'))
    ])
  ],
  encapsulation: ViewEncapsulation.None
})
export class DemoNavComponent implements OnInit {

  showSide: boolean = false;
  
  constructor() { }

  ngOnInit() {
  }

  toggleNav(){
    this.showSide = !this.showSide;
  }

  navOpened(){
    console.log("[DEMO]: ", "Nav opened.", this.showSide);
  }

  navClosed(){
    this.showSide = !this.showSide;
    console.log("[DEMO]: ", "Nav closed.", this.showSide);
  }

  get toggleState(){
    return this.showSide?"show":"hide";
  }
}
