import {Component, EventEmitter, Input, Output, OnInit, ViewChild, ElementRef, NgZone} from '@angular/core';
import {FormGroup} from '@angular/forms';
import { Observable, fromEvent } from 'rxjs';
import {startWith} from 'rxjs/operators';


@Component({
  selector: 'app-toggle-input',
  templateUrl: './toggle-input.component.html',
  styleUrls: ['./toggle-input.component.scss']
})
export class ToggleInputComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() controlLabel: string;
  @Input() controlSize: string = 'regular'; // Can be small, regular or large ;
  @Input() disabled: boolean = false;
  @Input() delimiter: boolean = true;
  @Input() mock: boolean = false;

  @ViewChild('inp') set inputField(inputField: ElementRef) {
    this.inp = inputField;
    if (this.inp) {
      this.e = fromEvent(this.inp.nativeElement, 'change');
      this.e.subscribe((e: any) => {
        this.pushOut(e.target.checked);
      });
    }
  }

  @Output() pushOutValue: EventEmitter<boolean> = new EventEmitter<boolean>();
  public inp: ElementRef;
  public e: Observable<Event>;
  sizedLayout: any = {};

  constructor(
    private _zone: NgZone
  ) {}
  ngOnInit() {

    this._zone.run(() => {
      switch (this.controlSize) {
        case 'small':
          this.sizedLayout['checkbox-container__small'] = true;
          break;
        case 'large':
          this.sizedLayout['checkbox-container__large'] = true;
          break;
        default:
          this.sizedLayout['checkbox-container__regular'] = true;
      }
    });

    // if (!this.mock) {
    //   this.e = fromEvent(this.inp.nativeElement, 'change');
    //   this.e.subscribe((e: any) => this.pushOut(e.target.checked) );
    // }
  }


  pushOut(bool) {
    this.pushOutValue.emit(bool);
  }

}
