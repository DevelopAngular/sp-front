import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormControl} from '@angular/forms';

const DEFAULT_COLORS = ['f3cd9c', '9cafc9', 'f5e395', '9ce6d4', 'faacb0', '9dd3f4', 'c8cbd4'];

@Component({
  selector: 'app-colored-checkbox',
  templateUrl: './colored-checkbox.component.html',
  styleUrls: ['./colored-checkbox.component.scss']
})
export class ColoredCheckboxComponent implements OnInit {

  @Input() title: string = null;
  @Input() options: string[];
  @Input() colors: string[] = DEFAULT_COLORS;
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

}
