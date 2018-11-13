import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-color-pallet-picker',
  templateUrl: './color-pallet-picker.component.html',
  styleUrls: ['./color-pallet-picker.component.scss']
})
export class ColorPalletPickerComponent implements OnInit {

  selectedId: number = 6;
  colors = [
      { id: 1, color: '#828a9d'},
      { id: 2,  color: '#f4483e'},
      { id: 3,  color: '#e48e14'},
      { id: 4,  color: '#eab203'},
      { id: 5,  color: '#68c41e'},
      { id: 6,  color: '#0bcb9d'},
      { id: 7,  color: '#139ce6'},
      { id: 8,  color: '#1598e7'},
      { id: 9,  color: '#0c3a75'},
      { id: 10,  color: '#6751f2'},
      { id: 11,  color: '#5451e3'},
      { id: 12,  color: '#ae10dd'},
      { id: 13,  color: '#da389d'}

  ];

  constructor() { }

  ngOnInit() {
  }

  changeColor(color) {
      this.selectedId = color.id;
      console.log('Color', color);
  }

}
