import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormControl} from '@angular/forms';

const DEFAULT_GRADIENTS = [
  ['#E38314', '#EAB219'],
  ['#0B9FC1', '#00C0C7'],
  ['#E7A700', '#EFCE00'],
  ['#5DBB21', '#78D118'],
  ['#F52B4F', '#F37426'],
  ['#5C4AE3', '#336DE4'],
  ['#022F68', '#2F66AB'],
]

@Component({
  selector: 'app-colored-checkbox',
  templateUrl: './colored-checkbox.component.html',
  styleUrls: ['./colored-checkbox.component.scss']
})
export class ColoredCheckboxComponent implements OnInit {

  @Input() title: string = null;
  @Input() options: string[];
  @Input() gradients: string[][] = DEFAULT_GRADIENTS;
  @Input() formArray: FormArray;

  selectedOptions: string[] = [];

  constructor() {
  }

  ngOnInit(): void {
  }

  onSelectionChange(option, checked): void {
    if (checked) {
      if (!this.formArray.value.includes(option)) {
        this.formArray.push(new FormControl(option));
      }
    } else if (this.formArray.value.includes(option)) {
      this.formArray.removeAt(this.formArray.value.findIndex(o => o === option));
    }
  }

  getBackgroundGradient(i){
    return `linear-gradient(to bottom right, ${this.gradients[i][0]}, ${this.gradients[i][1]})`;
  }

}
