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
    @Input() disabled: boolean = false;

    @Input() formGroup;
    @Input() controlName;

    @Output() onUpdate = new EventEmitter<string | number>();
    @Output() over = new EventEmitter();
    @Output() leave = new EventEmitter();
    @Output() blurEvent = new EventEmitter();

    @ViewChild('inp') input;

    private initialValue: string | number;

    public rightIconUntouched: string;

    public hovered: boolean;
    public pressed: boolean;
    constructor(
      public dialog: MatDialog,
      private sanitizer: DomSanitizer,
    ) {
      // this.rightIconUntouched = this.rightIcon.replace('Blue', 'Grey');
    }

    ngOnInit() {
      // console.log('right_icon ===> ', this.rightIcon);
      // this.rightIconUntouched = this.rightIcon.replace('Blue', 'Grey');
      of(null).pipe(
        delay(1000),
        switchMap(() => {
          return  this.formGroup.valueChanges;
        }),
      ).subscribe()
      if (this.isFocus) {
        this.updateFocus(this.input.nativeElement);
      }

      if (this.rightIcon) {
        this.rightIconUntouched = this.rightIcon.replace('Navy', 'Blue-Gray');
      }

      setTimeout(() => {
            this.controlName.setValue(this.input_value);
      }, 50);
        this.controlName.valueChanges.subscribe(res => {
          this.onUpdate.emit(res);
        });
    }

    // getBackground() {
    //       if (this.hovered || this.isFocus) {
    //         return '#EDEDED';          return this.sanitizer.bypassSecurityTrustStyle('#E2E7F4');
    //
    //       } else {
    //         return '#F7F7F7';          return this.sanitizer.bypassSecurityTrustStyle('#E2E7F4');
    //
    //       }
    // }

    updateFocus(el) {

      this.initialValue = this.input_value;

      if (this.isFocus) {
        el.focus();
      } else {
        el.blur();
      }
      // this.hovered = this.hovered ? false : true;
    }
    onBlur(value) {
      this.hovered = false;
      this.isFocus = false;
      if (!this.initialValue || (value !== this.initialValue)) {
        this.blurEvent.emit(value);
      }
    }
 }
