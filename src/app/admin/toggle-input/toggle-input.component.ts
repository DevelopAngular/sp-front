import {Component, EventEmitter, Input, Output, OnInit, ViewChild, ElementRef} from '@angular/core';
import {FormGroup} from '@angular/forms';
import { Observable, fromEvent } from 'rxjs';


@Component({
  selector: 'app-toggle-input',
  templateUrl: './toggle-input.component.html',
  styleUrls: ['./toggle-input.component.scss']
})
export class ToggleInputComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() controlLabel: string;

  @ViewChild('inp') inp: ElementRef;

  @Output() pushOutValue: EventEmitter<boolean> = new EventEmitter<boolean>();

  public e: Observable<MouseEvent>;

  constructor() { }
  ngOnInit() {
    this.e = fromEvent(this.inp.nativeElement, 'change')
    this.e.subscribe((e: any) => this.pushOut(e.target.checked) );
  }


  pushOut(bool) {
    this.pushOutValue.emit(bool);
  }

}
