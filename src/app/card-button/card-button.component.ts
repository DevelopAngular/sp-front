import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { bumpIn } from '../animations';
import {DataService} from '../data-service';

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
  @Input() margin_top: string;


  @Output() onClick: EventEmitter<any> = new EventEmitter();
  buttonDown = false;

  constructor(private dataService: DataService) { }

  ngOnInit() {
  // console.log('Passed gradiend ===> ', this.gradientColor);
  }

  get buttonState() {
    return (this.disabled?'up':(this.buttonDown ? 'down' : 'up'));
  }

  buttonClicked() {
    this.dataService.isActivePass$.next(false);
    if (!this.disabled) {
        this.onClick.emit();
    }
  }

  onPress(press: boolean) {
    this.buttonDown = press;
  }

  getGradient() {
    // console.log('Passed gradiend ===> ', this.gradientColor);
    if (this.gradientColor) {
      const gradient: string[] = this.gradientColor.split(',');
      return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
    }
    //   let gradient: string[] = '#134472, #549abb'.split(',');
  }
}
