import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

const DEFAULT_GRADIENTS = [
  'E48C15',
  '07ABC3',
  'EBBB00',
  '72CC1B',
  'F53D45',
  '5352E4',
];
const DEFAULT_OTHER_GRADIENT = '134482';

@Component({
  selector: 'app-colored-checkbox',
  templateUrl: './colored-checkbox.component.html',
  styleUrls: ['./colored-checkbox.component.scss']
})
export class ColoredCheckboxComponent implements OnInit {

  @Input() title: string = null;
  @Input() options: string[];
  @Input() other: boolean = false;
  @Input() gradients: string[] = DEFAULT_GRADIENTS;
  @Input() otherGradient: string = DEFAULT_OTHER_GRADIENT;
  @Input() formArray: FormArray;

  selectedOptions: string[] = [];
  otherSelected: boolean = false;
  otherFormGroup: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    if (this.other) {
      this.otherFormGroup = this.fb.group({
        other: ['', Validators.required]
      });
    }
  }

  onSelectionChange(option, event): void {
    if (event.checked) {
      if (option == 'other') {
        this.otherSelected = true;
        this.formArray.push(this.otherFormGroup.get('other'));
      } else if (!this.formArray.value.includes(option)) {
        this.formArray.push(new FormControl(option));
      }
    } else {
      if (option == 'other' && this.otherSelected) {
        this.otherSelected = false;
        this.formArray.removeAt(this.formArray.value.findIndex(o => o === this.otherFormGroup.get('other')));
      } else if (this.formArray.value.includes(option)) {
        this.formArray.removeAt(this.formArray.value.findIndex(o => o === option));
      }
    }
  }

  getBackgroundGradient(i) {
    return `linear-gradient(to bottom right, ${this.gradients[i][0]}, ${this.gradients[i][1]})`;
  }

  getOtherBackgroundGradient() {
    return `linear-gradient(to bottom right, ${this.otherGradient[0]}, ${this.otherGradient[1]})`;
  }

}
