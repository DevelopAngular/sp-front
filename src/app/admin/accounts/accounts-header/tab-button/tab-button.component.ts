import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DarkThemeSwitch} from '../../../../dark-theme-switch';

@Component({
  selector: 'app-tab-button',
  templateUrl: './tab-button.component.html',
  styleUrls: ['./tab-button.component.scss']
})
export class TabButtonComponent implements OnInit {

  @Input() title: string;
  @Input() icon_url: string;
  @Input() selected: boolean;

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

  constructor(public darkTheme: DarkThemeSwitch) { }

  ngOnInit() {
  }

  doClick() {
    this.buttonClick.emit();
  }

}
