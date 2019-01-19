import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-restricted-message',
  templateUrl: './restricted-message.component.html',
  styleUrls: ['./restricted-message.component.scss']
})
export class RestrictedMessageComponent implements OnInit {

  message: FormControl;

  constructor() { }

  get headerGradient() {
    const colors = '#03CF31,#00B476';
    return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
    this.message = new FormControl('');
  }

  sendRequest() {
    console.log(this.message.value);
  }

}
