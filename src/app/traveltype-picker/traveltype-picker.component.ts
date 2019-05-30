import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-traveltype-picker',
  templateUrl: './traveltype-picker.component.html',
  styleUrls: ['./traveltype-picker.component.scss']
})
export class TraveltypePickerComponent implements OnInit {

  @Input() choices: string[];
  @Input() altColor: string = '#FFFFFF';
  @Input() border: string = '#FFFFFF';
  @Input() width: string = '120px';
  @Input() height: string = '20px';

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  choice1: string;
  choice2: string;
  selectedChoice: string;
  bottomRadius: boolean = true;

  constructor() { }

  ngOnInit() {
    if (this.choices.length === 2) {
      if (this.choices[0] === 'unrestricted') {
        this.choice1 = 'Unrestricted';
        this.choice2 = 'Restricted';
      } else {
        this.choice1 = 'Round-trip';
        this.choice2 = 'One-way';
      }
    } else {
      this.choice1 = this.choices[0] === 'round_trip' ? 'Round-trip' : 'One-way';
      this.choice2 = null;
    }
    this.selectedChoice = this.choice1;
    this.onSelect.emit(this.travelValue(this.selectedChoice));
  }

  updateTravelType(travelType: string) {
    if (travelType === 'Round-trip' || travelType === 'Unrestricted') {
      this.bottomRadius = true;
    } else {
      this.bottomRadius = false;
    }
    this.selectedChoice = travelType;
    this.onSelect.emit(this.travelValue(travelType));
  }

  travelValue(travelType: string) {
      switch (travelType) {
          case 'Round-trip':
              return 'round_trip';
          case 'One-way':
              return 'one_way';
          case 'Unrestricted':
              return 'unrestricted';
          case 'Restricted':
              return 'restricted';
      }
  }

  getFontColor(choice: string) {
     return this.selectedChoice === choice ? this.altColor : '#FFFFFF';
  }

  getBackgroundColor(choice: string) {
    if (this.selectedChoice !== choice) {
      return this.altColor;
    }
    // return this.selectedChoice === choice ? '#FFFFFF' : this.altColor;
  }
}
