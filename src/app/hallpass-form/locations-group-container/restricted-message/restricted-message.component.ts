import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormControl } from '@angular/forms';
import {LocationService} from '../location.service';

@Component({
  selector: 'app-restricted-message',
  templateUrl: './restricted-message.component.html',
  styleUrls: ['./restricted-message.component.scss']
})
export class RestrictedMessageComponent implements OnInit {

  @Input() pinnable;

  @Input() teacher;

  @Input() date;

  @Input() fromLocation;

  @Input() toLocation;

  @Output() resultMessage: EventEmitter<any> = new EventEmitter<any>();

  message: FormControl;

  constructor(private locService: LocationService) { }

  get headerGradient() {
    const colors = this.pinnable.gradient_color;
    return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
    this.message = new FormControl('');
  }

  back() {
    this.locService.changeLocation$.next('restrictedTarget');
  }

  sendRequest() {
    this.resultMessage.emit(this.message.value);
  }

}
