import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AUTOCOMPLETE_OPTION_HEIGHT } from '@angular/material';

@Component({
  selector: 'app-card-button',
  templateUrl: './card-button.component.html',
  styleUrls: ['./card-button.component.scss']
})
export class CardButtonComponent implements OnInit {

  @Input() width: string;
  @Input() height: string;
  @Input() overlayWidth: string = '0px';
  @Input() valid: boolean = true;
  @Input() content: string;

  @Output() onClick: EventEmitter<any> = new EventEmitter(); 

  constructor() { }

  ngOnInit() {
  }

  buttonClicked(){
    this.onClick.emit();
  }
}
