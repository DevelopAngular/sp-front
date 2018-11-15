import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss']
})
export class IconPickerComponent implements OnInit {

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  selectedId: number = 5;
  icons = [
      { id: 1, active: '../../../assets/Gear (Blue).png', inactive: '../../../assets/Gear (White).png'},
      { id: 2, active: '../../../assets/Grid (Blue).png', inactive: '../../../assets/Grid (White).png'},
      { id: 3, active: '../../../assets/Calendar (Blue).png', inactive: '../../../assets/Calendar (White).png'},
      { id: 4, active: '../../../assets/Check (Blue).png', inactive: '../../../assets/Check (White).png'},
      { id: 5, active: '../../../assets/Hallway (Blue).png', inactive: '../../../assets/Hallway (White).png'},
      { id: 6, active: '../../../assets/My Room (Blue).png', inactive: '../../../assets/My Room (White).png'},
      { id: 7, active: '../../../assets/Request (Blue).png', inactive: '../../../assets/Request (White).png'},
      { id: 8, active: '../../../assets/Search (Blue).png', inactive: '../../../assets/Search (White).png'},
      { id: 9, active: '../../../assets/Star (Blue).png', inactive: '../../../assets/Star (White).png'}
  ];

  constructor() { }

  ngOnInit() {
  }

  changeIcon(icon) {
    this.selectedId = icon.id;
    this.selectedEvent.emit(icon);
  }

}
