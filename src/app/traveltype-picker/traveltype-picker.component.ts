import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-traveltype-picker',
  templateUrl: './traveltype-picker.component.html',
  styleUrls: ['./traveltype-picker.component.css']
})
export class TraveltypePickerComponent implements OnInit {

  @Input() choices: string[];

  @Output() onSelect:EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
