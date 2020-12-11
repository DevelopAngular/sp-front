import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-pin-input',
  templateUrl: './pin-input.component.html',
  styleUrls: ['./pin-input.component.scss']
})
export class PinInputComponent implements OnInit {

  @Output() changes: EventEmitter<string> = new EventEmitter<string>();

  @Input() control: FormControl;
  @Input() group: FormGroup;
  @Input() value: string;

  @ViewChild('input') input: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

}
