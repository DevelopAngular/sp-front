import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-color-pallet-picker',
  templateUrl: './color-pallet-picker.component.html',
  styleUrls: ['./color-pallet-picker.component.scss']
})
export class ColorPalletPickerComponent implements OnInit {

  colors = [
      { color: '#828a9d', selected: false },
      { color: '#f4483e', selected: false },
      { color: '#e48e14', selected: false },
      { color: '#eab203', selected: false },
      { color: '#68c41e', selected: false },
      { color: '#0bcb9d', selected: false },
      { color: '#139ce6', selected: false },
      { color: '#1598e7', selected: false },
      { color: '#0c3a75', selected: false },
      { color: '#6751f2', selected: false },
      { color: '#5451e3', selected: false },
      { color: '#ae10dd', selected: false },
      { color: '#da389d', selected: true }

  ];

  constructor() { }

  ngOnInit() {
  }

  changeColor(color) {
    this.colors.forEach(item => item.selected = false);
    color.selected = true;
    console.log(color.color);
  }

}
