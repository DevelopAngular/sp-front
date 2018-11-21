import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-color-pallet-picker',
    templateUrl: './color-pallet-picker.component.html',
    styleUrls: ['./color-pallet-picker.component.scss']
})
export class ColorPalletPickerComponent implements OnInit {

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  selectedId: number;
  colors = [
      { id: 1, color: '#828a9d', gradientColor: '#606981, #ACB4C1'},
      { id: 2,  color: '#f4483e', gradientColor: '#F52B4F, #F37426'},
      { id: 3,  color: '#e48e14', gradientColor: '#E38314,#EAB219'},
      { id: 4,  color: '#eab203'},
      { id: 5,  color: '#68c41e', gradientColor: '#5DBB21, #78D118'},
      { id: 6,  color: '#0bcb9d'},
      { id: 7,  color: '#139ce6', gradientColor: '#0B9FC1,#00C0C7'},
      { id: 8,  color: '#1598e7', gradientColor: '#1893E9,#05B5DE'},
      { id: 9,  color: '#0c3a75', gradientColor: '#5C4AE3,#336DE4'},
      { id: 10,  color: '#6751f2'},
      { id: 11,  color: '#5451e3'},
      { id: 12,  color: '#ae10dd'},
      { id: 13,  color: '#da389d', gradientColor: '#A503E3,#CF39C7'}

  ];

  constructor() { }

  ngOnInit() {
  }

    changeColor(color) {
        this.selectedId = color.id;
        this.selectedEvent.emit(color);
    }

}
