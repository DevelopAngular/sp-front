import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-traveltype-picker',
  templateUrl: './traveltype-picker.component.html',
  styleUrls: ['./traveltype-picker.component.css']
})
export class TraveltypePickerComponent implements OnInit {

  @Input() choices: string[];
  @Input() textColor: string = '#000000';

  @Output() onSelect:EventEmitter<any> = new EventEmitter();

  choice1:string;
  choice2:string;
  selectedChoice:string;
  constructor() { }

  ngOnInit() {
    this.choice1 = this.choices.length==2?'Round-trip':(this.choices[0]==='round_trip'?'Round-trip':'One-way')
    this.choice2 = this.choices.length==2?'One-way':null;
    this.selectedChoice = this.choice1;
  }

  updateTravelType(travelType:string){
    this.selectedChoice = travelType;
    this.onSelect.emit(travelType==='Round-trip'?'round_trip':'one_way');
  }

  getFontColor(choice:string){
    return this.selectedChoice===choice?this.textColor:'#FFFFFF';
  }

  getBackgroundColor(choice:string){
    return this.selectedChoice===choice?'#FFFFFF':this.textColor;
  }
}
