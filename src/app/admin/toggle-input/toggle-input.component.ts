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

  @ViewChild('inp') inp: ElementRef;

  @Output() pushOutValue: EventEmitter<boolean> = new EventEmitter<boolean>();

  public e: Observable<Event>;
  sizedLayout: any = {};

  constructor(
    private _zone: NgZone
  ) {
    // switch (this.controlSize) {
    //   case 'small':
    //     this.sizedLayout['future__small'] = true;
    //     break;
    //   case 'large':
    //     this.sizedLayout['future__large'] = true;
    //     break;
    //   default:
    //     this.sizedLayout['future__regular'] = true;
    // }
  }
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
    })

    this.e = fromEvent(this.inp.nativeElement, 'change');
    this.e.subscribe((e: any) => this.pushOut(e.target.checked) );
  }


  pushOut(bool) {
    this.pushOutValue.emit(bool);
  }

}
