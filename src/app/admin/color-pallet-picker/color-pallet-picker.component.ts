import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-color-pallet-picker',
    templateUrl: './color-pallet-picker.component.html',
    styleUrls: ['./color-pallet-picker.component.scss']
})
export class ColorPalletPickerComponent implements OnInit {

  @Input() colors;

  @Input() selectedColorProfile;

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  selectedId: number;

  constructor() { }

  ngOnInit() {
      if (this.selectedColorProfile) {
          this.selectedId = this.selectedColorProfile.id;
      }
  }

    changeColor(color) {
        this.selectedId = color.id;
        this.selectedEvent.emit(color);
    }

}
