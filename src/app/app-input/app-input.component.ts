import {Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges, OnChanges, OnDestroy} from '@angular/core';
import { MatDialog } from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {merge, of, Subject} from 'rxjs';


@Component({
  selector: 'app-input',
  templateUrl: './app-input.component.html',
  styleUrls: ['./app-input.component.scss']
})
export class AppInputComponent implements OnInit, OnChanges, OnDestroy {

    @Input() input_type: string = 'text';
    @Input() input_value: string | number;
    @Input() input_label: string;
    @Input() placeholder: string = '';
    @Input() maxLength: string = '100';
    @Input() width: string = '0px';
    @Input() height: string = '40px';
    @Input() padding: string = '8px';
    @Input() fieldSpace: string = '0px';
    @Input() rightIcon: string;
    @Input() tooltipText: string;
    @Input() textAlign: string;
    @Input() isErrorIcon: boolean = true;
    @Input() isFocus: boolean;
    @Input() forcedFocus: boolean;
    @Input() errorIconTop: number = 8;
    @Input() disabled: boolean = false;
    @Input() isSuccessIcon: boolean;
    @Input() forceFocus$: Subject<boolean> = new Subject<boolean>();
    @Input() autocomplete: string = 'off';

    @Input() formGroup;
    @Input() controlName;

    @Output() onUpdate = new EventEmitter<string | number>();
    @Output() over = new EventEmitter();
    @Output() leave = new EventEmitter();
    @Output() blurEvent = new EventEmitter();
    @Output() focusEvent = new EventEmitter();

    @ViewChild('inp') input;

    private initialValue: string | number;

    public hovered: boolean;
    public pressed: boolean;
    private destroy$ = new Subject();


    constructor(
      public dialog: MatDialog,
      private sanitizer: DomSanitizer,
    ) {}

    get containerWidth() {
        return this.width ? parseFloat(this.width) + 16 + 'px' : 0;
    }

    ngOnInit() {
      merge(of(''), this.forceFocus$)
        .subscribe(() => {
          setTimeout(() => {
            if (this.isFocus) {
              this.input.nativeElement.focus();
            } else {
              this.input.nativeElement.blur();
            }
          }, 50);
        });

      setTimeout(() => {
            this.controlName.setValue(this.input_value);
      }, 50);
        this.controlName.valueChanges
          .subscribe(res => {
          this.onUpdate.emit(res);
        });
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

    ngOnChanges(sc: SimpleChanges) {
        if ('forcedFocus' in sc && !sc.forcedFocus.isFirstChange() && sc.forcedFocus.currentValue) {
          this.input.nativeElement.focus();
        }
    }

    updateFocus(el) {

      this.initialValue = this.input_value;

      if (this.isFocus) {
        el.focus();
        this.focusEvent.emit();
      } else if (!this.forcedFocus) {
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
