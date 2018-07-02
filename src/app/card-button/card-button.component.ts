import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { bumpIn } from '../animations';

@Component({
  selector: 'app-card-button',
  templateUrl: './card-button.component.html',
  styleUrls: ['./card-button.component.scss'],
  animations: [
    bumpIn
  ]
})
export class CardButtonComponent implements OnInit {

  @Input() width: string;
  @Input() height: string;
  @Input() overlayWidth: string = '0px';
  @Input() valid: boolean = true;
  @Input() content: string;

  @Output() onClick: EventEmitter<any> = new EventEmitter(); 

  buttonDown = false;

  constructor() { }

  ngOnInit() {
  }

  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }
  
  buttonClicked(){
    this.onClick.emit();
  }

  onPress(press: boolean) {
    this.buttonDown = press;
    console.log('asd');
  }
}
