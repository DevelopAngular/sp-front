import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-restriction-picker',
  templateUrl: './restriction-picker.component.html',
  styleUrls: ['./restriction-picker.component.scss']
})
export class RestrictionPickerComponent implements OnInit {

  @Input() choices: string[];
  @Input() width: number;  // px
  @Input() height: number;  // px
  @Input() selectedColor: string = '#1d1a5e';
  @Input() backgroundColor: string = '#FFFFFF';
  @Input() selectedChoose: any;
  @Input() fontSize: number = 15;  // px
  @Input() disabled: boolean;
  @Input() padding: number = 5;      // px

  @Output() result: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    if (this.selectedChoose) {
      this.result.emit(this.selectedChoose);
    }
  }

  onClick(choice) {
    this.selectedChoose = choice;
    this.result.emit(choice);
  }

}
