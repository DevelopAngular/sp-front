import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {findIndex, pullAll} from 'lodash';
import {Select} from '../animations';

@Component({
  selector: 'app-restriction-picker',
  templateUrl: './restriction-picker.component.html',
  styleUrls: ['./restriction-picker.component.scss'],
  animations: [Select]
})
export class RestrictionPickerComponent implements OnInit {

  @Input() choices: string[];
  @Input() width: number;  // px
  @Input() height: number = 32;  // px
  @Input() color: string = '#7F879D';
  @Input() selectedColor: string = '#FFFFFF';
  @Input() backgroundColor: string = '#1E194F';
  @Input() selectedChoice: any;
  @Input() fontSize: number = 13;  // px
  @Input() disabled: boolean;
  @Input() disabledOptions: string[];
  @Input() padding: number = 5;      // px
  @Input() tooltipText: string;

  @Output() result: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    if (this.selectedChoice) {
      if (this.disabledOptions && this.choices.length - this.disabledOptions.length === 1) {
        this.selectedChoice = pullAll([...this.choices], [...this.disabledOptions])[0];
      }
      this.result.emit(this.selectedChoice);
    }
  }

  isDisabled(option) {
      return findIndex(this.disabledOptions, (opt) => {
          return option === opt;
      }) > -1;
  }

  onClick(choice) {
    if (!this.isDisabled(choice)) {
        this.selectedChoice = choice;
        this.result.emit(choice);
    }
  }

}
