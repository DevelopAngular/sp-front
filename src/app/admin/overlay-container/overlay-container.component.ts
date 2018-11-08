import { Component, OnInit } from '@angular/core';
import {HallPass} from '../../models/HallPass';
import {Invitation} from '../../models/Invitation';
import {Request} from '../../models/Request';

@Component({
  selector: 'app-overlay-container',
  templateUrl: './overlay-container.component.html',
  styleUrls: ['./overlay-container.component.scss']
})
export class OverlayContainerComponent implements OnInit {

  pass: HallPass | Invitation | Request;
  title: string = 'Bathroom';

  constructor() { }

  get getHeaderGradient() {
    return `radial-gradient(circle at 73% 71%, rgb(92, 74, 227), rgb(51, 109, 228))`;
  }

  ngOnInit() {
  }

  toggleChange() {
    console.log('toggle');
  }

  onCancel() {
    console.log('concel');
  }

}
