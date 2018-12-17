import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-toggle-picker',
  templateUrl: './toggle-picker.component.html',
  styleUrls: ['./toggle-picker.component.scss']
})
export class TogglePickerComponent implements OnInit {

    @Input() choices: string[];
    @Input() altColor: string = '#FFFFFF';
    @Input() border: string = '#FFFFFF';
    @Input() width: string = '120px';
    @Input() height: string = '20px';
    @Input() currentChoose;
    @Input() selectedChoice: string;
    @Input() disabled: boolean;
    @Input() noSelected: boolean = false;
    @Input() fontSize: string = '11px';
    @Output() onDirty: EventEmitter<boolean> = new EventEmitter();
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    choice1: string;
    choice2: string;
    choice3: string;
    bottomRadius: boolean = true;

    choice1_values: string[] = [];
    choice2_values: string[] = [];
    choice3_values: string[] = [];

    disabledColor = '#999999';
  constructor() { }

  ngOnInit() {
      if (this.choices.length === 3) {
              this.choice1 = this.choices[0];
              this.choice2 = this.choices[1];
              this.choice3 = this.choices[2];
      }
      if (this.choices.length === 2) {
          this.choice1 = this.choices[0];
          this.choice2 = this.choices[1];
      }
      if (this.currentChoose) {
          if (_.isArray(this.currentChoose)) {
              if (this.currentChoose.includes('round_trip')) {
                  this.selectedChoice = 'Round-trip';
              }
              if (this.currentChoose.includes('one_way')) {
                  this.selectedChoice = 'One-way';
              }
              if (this.currentChoose.includes('round_trip') && this.currentChoose.includes('one_way')) {
                  this.selectedChoice = 'Both';
              }
          } else {
              switch (this.currentChoose) {
                  case false: {
                      this.selectedChoice = 'Unrestricted';
                      break;
                  }
                  case true: {
                      this.selectedChoice = 'Restricted';
                  }
              }
          }
      } else {
        if (this.noSelected) {
          this.selectedChoice = '';
        } else {

          this.selectedChoice = this.selectedChoice ? this.selectedChoice : this.choice1;
        }
      }
      this.onSelect.emit(this.travelValue(this.selectedChoice));
  }

  updateType(travelType: string) {
      if (travelType === this.choices[0]) {
          this.bottomRadius = true;
      } else {
          this.bottomRadius = false;
      }
      this.selectedChoice = travelType;
      if (this.selectedChoice === this.choices[0]) {
          this.choice1_values.fill('0');
      } else if (this.selectedChoice === this.choices[1]) {
          this.choice2_values.fill('0');
      } else {
          this.choice3_values.fill('0');
      }

      this.onSelect.emit(this.travelValue(travelType));
      this.onDirty.emit(true);
  }

  travelValue(travelType: string) {
     return travelType;
  }

  getFontColor(choice: string) {
    if (!this.selectedChoice) {
        return this.disabledColor;
    }
    return this.selectedChoice !== choice ? this.altColor : '#FFFFFF';
  }

  getBackgroundColor(choice: string) {
      if (this.selectedChoice === choice) {
          return this.altColor;
      }
      // return this.selectedChoice === choice ? '#FFFFFF' : this.altColor;
  }

  displayValues() {
      if (this.selectedChoice === this.choices[0]) {

      } else if (this.selectedChoice === this.choices[1]){

      } else {

      }
  }

}
