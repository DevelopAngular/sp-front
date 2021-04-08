import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-g-suite-info',
  templateUrl: './g-suite-info.component.html',
  styleUrls: ['./g-suite-info.component.scss']
})
export class GSuiteInfoComponent implements OnInit {

  @Output() back: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

}
