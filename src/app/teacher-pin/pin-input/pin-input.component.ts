import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-pin-input',
  templateUrl: './pin-input.component.html',
  styleUrls: ['./pin-input.component.scss']
})
export class PinInputComponent implements OnInit, AfterViewInit {

  @Output() changes: EventEmitter<string> = new EventEmitter<string>();

  @Input() control: FormControl;
  @Input() group: FormGroup;
  @Input() value: string;
  @Input() focused: boolean;

  @ViewChild('inp', { static: true }) inp: ElementRef;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.focused) {
        this.inp.nativeElement.focus();
      } else {
        this.inp.nativeElement.blur();
      }
    }, 50);
  }

  ngAfterViewInit() {
  }

  focusEvent(event) {
    this.focused = true;
  }

  blurEvent(event) {
    this.focused = false;
  }

}
