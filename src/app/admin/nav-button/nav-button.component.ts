import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnChanges
} from '@angular/core';
import {DarkThemeSwitch} from '../../dark-theme-switch';

@Component({
  selector: 'app-nav-button',
  templateUrl: './nav-button.component.html',
  styleUrls: ['./nav-button.component.scss']
})
export class NavButtonComponent implements OnInit, OnChanges {

  @Input() icon: string;
  @Input() content: string;
  @Input() selected: boolean = false;

  @Output() selectedButton: EventEmitter<any> = new EventEmitter();
  @Output() onClick: EventEmitter<any> = new EventEmitter();

  public iconId: string;

  get textColor() {
    return this.selected ? '#00B476' : this.darkTheme.isEnabled$.value ? '#FFFFFF' : ' #7E879D';
  }

  constructor(
    private darkTheme: DarkThemeSwitch,
  ) { }

  ngOnInit() {
    this.iconId = `#${this.icon}`;
  }

  ngOnChanges() {
    if (this.selected) {
      this.selectedButton.emit(this.selected);
    }
  }

  doClick() {
    this.onClick.emit(this.selected);
  }

}
