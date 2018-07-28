import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  @Input() options: any[];
  
  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    
  }

  optionSelected(option: any){
    this.onSelect.emit(option);
  }

}
