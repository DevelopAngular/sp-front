import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './app-input.component.html',
  styleUrls: ['./app-input.component.scss']
})
export class AppInputComponent implements OnInit {

    @Input() input_type: string = "text";
    @Input() input_class: string;
    @Input() input_value: string = "";
    @Input() Success: boolean;
    @Input() input_label: string;
    @Output() onUpdate = new EventEmitter<string>();

    @ViewChild('appInput') input: ElementRef; 

    constructor() { }

  ngOnInit() {
  }

  ChangeStatus(status) {
      this.Success = status;
  }

  UpdateInputValue()
  {
      this.input_value = this.input.nativeElement.value;
      this.onUpdate.emit(this.input_value);
  }

 


 
}
