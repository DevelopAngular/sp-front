import {Component, OnInit, Input, Output, EventEmitter, ViewChild, Renderer2} from '@angular/core';
import { MatDialog } from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {delay, switchMap, tap} from 'rxjs/operators';
import {of} from 'rxjs';


@Component({
  selector: 'app-input',
  templateUrl: './app-input.component.html',
  styleUrls: ['./app-input.component.scss']
})
export class AppInputComponent implements OnInit {

    @Input() input_type: string = 'text';
    @Input() input_class: string;
    @Input() input_value: string | number;
    @Input() input_label: string;
    @Input() placeholder: string = '';
    @Input() maxLength: number = 100;
    @Input() width: string;
    @Input() height: string = '22px';
    @Input() padding: string = '8px';
    @Input() rightIcon: string;
    @Input() tooltipText: string;
    @Input() textAlign: string;
    @Input() isErrorIcon: boolean = true;
    @Input() isFocus: boolean;
    @Input() errorIconTop: number = 8;
    @Input() disabled: boolean = false;

    @Input() formGroup;
    @Input() controlName;

    @Output() onUpdate = new EventEmitter<string | number>();
    @Output() over = new EventEmitter();
    @Output() leave = new EventEmitter();
    @Output() blurEvent = new EventEmitter();

    @ViewChild('inp') input;

    private initialValue: string | number;

    public hovered: boolean;
    public pressed: boolean;


    constructor(
      public dialog: MatDialog,
      private sanitizer: DomSanitizer,
    ) {}

    get containerWidth() {
        return this.width ? parseFloat(this.width) + 16 + 'px' : 0;
    }

    ngOnInit() {
      // console.log('right_icon ===> ', this.isFocus);
      of(null).pipe(
        delay(1000),
        switchMap(() => {
          return  this.formGroup.valueChanges;
        }),
      ).subscribe();
      if (this.isFocus) {
          this.input.nativeElement.focus();
      }

      setTimeout(() => {
            this.controlName.setValue(this.input_value);
      }, 50);
        this.controlName.valueChanges.subscribe(res => {
          this.onUpdate.emit(res);
        });
    }

    updateFocus(el) {

      this.initialValue = this.input_value;

      if (this.isFocus) {
        el.focus();
      } else {
        el.blur();
      }
    }
    onBlur(value) {
      this.hovered = false;
      this.isFocus = false;
      if (!this.initialValue || (value !== this.initialValue)) {
        this.blurEvent.emit(value);
      }
    }
 }
