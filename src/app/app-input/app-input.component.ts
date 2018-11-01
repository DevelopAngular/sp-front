import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './app-input.component.html',
  styleUrls: ['./app-input.component.scss']
})
export class AppInputComponent implements OnInit {

    @Input() input_type: string = "text";
    @Input() input_class: string;
    @Input() input_value: string;
    @Input() Success: boolean;
    @Input() input_label: string;
    @Output() getInputValueEvent = new EventEmitter<string>();

    constructor() { }

  ngOnInit() {
  }

  ChangeStatus(status)
  {
    debugger;  
    this.Success = status;
  }

  getInputValue()
  {
      this.getInputValueEvent.emit(this.input_value);
  }

}
