import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-consent-menu',
  templateUrl: './consent-menu.component.html',
  styleUrls: ['./consent-menu.component.css']
})
export class ConsentMenuComponent implements OnInit {
  @Input()
  content: string = "Are you sure?";

  @Input()
  header: string = "Header";

  @Input()
  visible: boolean = false;

  @Output()
  onAccept: EventEmitter<null> = new EventEmitter<null>();

  @Output()
  onDecline: EventEmitter<null> = new EventEmitter<null>();

  constructor() { }

  ngOnInit() {

  }

  click(val){
    if(val)
      this.onAccept.emit();
    else
      this.onDecline.emit();
  }
}
