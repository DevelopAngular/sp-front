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
  @Input() disabled: boolean;
  @Input() content: string;
  @Input() gradientColor: string;


  @Output() onClick: EventEmitter<any> = new EventEmitter(); 

  buttonDown = false;

  constructor() { }

  ngOnInit() {
  }

  get buttonState() {
    return (this.disabled?'up':(this.buttonDown ? 'down' : 'up'));
  }
  
  buttonClicked(){
    if(!this.disabled)
      this.onClick.emit();
  }

  onPress(press: boolean) {
    this.buttonDown = press;
  }

  getGradient() {
    let gradient: string[] = this.gradientColor.split(',');

    return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
  }
}
