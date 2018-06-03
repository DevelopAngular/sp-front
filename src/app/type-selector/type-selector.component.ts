import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-type-selector',
  templateUrl: './type-selector.component.html',
  styleUrls: ['./type-selector.component.css']
})
export class TypeSelectorComponent implements OnInit {

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  selectedType = 'round_trip';

  constructor() {
  }

  ngOnInit() {

  }

  update(type: String) {
    if (type == 'rt') {
      this.selectedType = 'round_trip';
    } else {
      this.selectedType = 'one_way';
    }
    this.onChange.emit(this.selectedType);
  }

}
