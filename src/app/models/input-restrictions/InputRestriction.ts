import {ElementRef} from '@angular/core';

export interface InputRestriction {
  labelText?: string;
  placeholder?: string;
  type?: string;
  initialValue?: string; // Allowed only if type is multi*
  html5type?: string; // text, password, number etc.
  hasTogglePicker?: boolean;
  boxShadow?: boolean;
  width?: string;
  minWidth?: string;
  fieldIcon?: string;
  fieldIconPosition?: string; // Can be 'right' or 'left'
  closeIcon?: boolean;
  disabled?: boolean;
  focused?: boolean;
  chipInput?: ElementRef;
  selections?: any[];
}
