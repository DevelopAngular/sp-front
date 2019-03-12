import { Component, Input, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
  }

  onClick(choice) {
    this.selectedChoose = choice;
  }

}
