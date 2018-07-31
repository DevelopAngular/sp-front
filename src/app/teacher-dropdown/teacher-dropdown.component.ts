import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '../NewModels';

@Component({
  selector: 'app-teacher-dropdown',
  templateUrl: './teacher-dropdown.component.html',
  styleUrls: ['./teacher-dropdown.component.scss']
})
export class TeacherDropdownComponent implements OnInit {

  @Input() options: Location[];
  selected: Location;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  showOptions: boolean = false;

  constructor() {
    
  }

  get choices(){
    return this.options.filter(function(value){return value !== this.selected}.bind(this));
  }

  ngOnInit() {
    this.selected = this.options[0];
  }

}
