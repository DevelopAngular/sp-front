import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-restriction-picker',
  templateUrl: './restriction-picker.component.html',
  styleUrls: ['./restriction-picker.component.scss']
})
export class RestrictionPickerComponent implements OnInit {

  @Input() choices: string[];
  @Input() width: number;  // px
  @Input() height: number = 25;  // px
  @Input() selectedColor: string = '#1E194F';
  @Input() backgroundColor: string = '#FFFFFF';
  @Input() selectedChoose: any;
  @Input() fontSize: number = 13;  // px
  @Input() disabled: boolean;
  @Input() disabledOptions: string[];
  @Input() padding: number = 5;      // px

  @Output() result: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    if (this.selectedChoose) {
      this.result.emit(this.selectedChoose);
    }
  }

  isDisabled(option) {
      return _.findIndex(this.disabledOptions, (opt) => {
          return option === opt;
      }) > -1;
  }

  onClick(choice) {
    if (!this.isDisabled(choice)) {
        this.selectedChoose = choice;
        this.result.emit(choice);
    }
  }

}
