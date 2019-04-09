import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {DarkThemeSwitch} from '../dark-theme-switch';

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

  constructor(
    private darkTheme: DarkThemeSwitch
  ) { }


  get textColor(){
    return this.selected?'#3D396B': this.darkTheme.isEnabled$.value ? '#FFFFFF' : ' #7E879D';
  }

  get backgroundColor(){
    return this.selected?'#E4EBFF':'none';
  }

  get _icon(){
    return this.darkTheme.getIcon({iconName: this.icon, setting: null, hover: this.selected});

    // return this.icon +(this.selected ? ' (Navy)' : ' (Blue-Gray)') + '.svg';
  }


  ngOnInit() {
    
  }

  doClick(){
    this.onClick.emit(this.selected);
  }

}
