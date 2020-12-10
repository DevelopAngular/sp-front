import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-pin-input',
  templateUrl: './pin-input.component.html',
  styleUrls: ['./pin-input.component.scss']
})
export class PinInputComponent implements OnInit {

  @Output() changes: EventEmitter<string> = new EventEmitter<string>();

  @Input() formControl: FormControl;
  @Input() value: string;

  @ViewChild('input') input: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

}
