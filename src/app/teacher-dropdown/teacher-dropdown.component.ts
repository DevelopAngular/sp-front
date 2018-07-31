import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '../NewModels';

@Component({
  selector: 'app-teacher-dropdown',
  templateUrl: './teacher-dropdown.component.html',
  styleUrls: ['./teacher-dropdown.component.scss']
})
export class TeacherDropdownComponent implements OnInit {

  @Input() options: Location[];
  selectedIndex: number = 0;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  showOptions: boolean = false;

  constructor() {
    
  }

  get choices(){
    return this.options.filter(function(value, index, array){return array[index].id != array[this.selectedIndex].id}.bind(this));
  }

   get showArrow(){
     if(this.options){
       if(this.options.length>1){
         return true;
       }
     } else {
       return false;
     }
   }

  ngOnInit() {

  }

}
