import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormControl } from '@angular/forms';
import {LocationService} from '../location.service';
import {Navigation} from '../../hallpass-form.component';

@Component({
  selector: 'app-restricted-message',
  templateUrl: './restricted-message.component.html',
  styleUrls: ['./restricted-message.component.scss']
})
export class RestrictedMessageComponent implements OnInit {

  @Input() formState: Navigation;

  @Input() teacher;

  @Input() date;

  fromLocation;

  toLocation;

  @Output() resultMessage: EventEmitter<any> = new EventEmitter<any>();

  message: FormControl;

  constructor(private locService: LocationService) { }

  get headerGradient() {
    const colors = this.formState.data.direction.pinnable.gradient_color;
    return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
    this.message = new FormControl('');
    this.fromLocation = this.formState.data.direction.from;
    this.toLocation = this.formState.data.direction.to;
    this.teacher = this.formState.data.requestTarget;
  }

  back() {
    this.locService.back();
  }

  sendRequest() {
    this.resultMessage.emit(this.message.value);
  }

}
