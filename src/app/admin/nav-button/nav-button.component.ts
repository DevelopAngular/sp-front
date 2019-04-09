import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {DarkThemeSwitch} from '../../dark-theme-switch';

@Component({
  selector: 'app-nav-button',
  templateUrl: './nav-button.component.html',
  styleUrls: ['./nav-button.component.scss']
})
export class NavButtonComponent implements OnInit {

  @Input() icon: string;
  @Input() content: string;
  @Input() selected: boolean = false;

  @Output() onClick: EventEmitter<any> = new EventEmitter();

  

  get textColor(){
    // return this.selected?'#3D396B':'#7E879D';
    return this.selected?'#3D396B': this.darkTheme.isEnabled$.value ? '#FFFFFF' : ' #7E879D';

  }

  get backgroundColor() {

    return this.selected?'#E4EBFF':'none';
  }

  get _icon() {

    // return this.darkTheme.getIcon({iconName: 'Navy', setting: null, hover: this.selected});
    return this.icon +(this.selected?' (Navy)': this.darkTheme.isEnabled$.value ? ' (White)' : ' (Blue-Gray)') + '.svg';
  }

  constructor(
    private darkTheme: DarkThemeSwitch
  ) { }

  ngOnInit() {
    
  }

  doClick(){
    this.onClick.emit(this.selected);
  }

}
