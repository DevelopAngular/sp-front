import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';


class Icon {
    public state: boolean;

    constructor(private active: string,
                private inactive: string) {
    }

    toggleState() {
        this.state = !this.state;
    }

    get Thumbnail(): string {
        return this.state ? this.active : this.inactive;
    }
}

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss']
})
export class IconPickerComponent implements OnInit {

  @Input() set icons(value: Array<string>) {
      if (value) {
          const blueIcons = value.filter(icon => icon.includes('(Blue)'));
          const whiteIcons = value.filter(icon => icon.includes('(White)'));
          this._icons = whiteIcons.map((white, index) => {
              return new Icon(blueIcons[index], white);
          });
      }
  }

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  _icons: Array<Icon>;

  public selectedIcon: Icon;

  constructor() { }

  ngOnInit() {
  }

  changeIcon(icon) {
      if (this.selectedIcon) {
          this.selectedIcon.toggleState();
      }
      this.selectedIcon = icon;
      this.selectedIcon.toggleState();
      this.selectedEvent.emit(icon);
  }

}
