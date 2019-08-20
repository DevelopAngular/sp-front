import {EventEmitter, Input, Output} from '@angular/core';

export interface ButtonRestriction {
  size?: string;
  border?: string;
  withShadow?: boolean;
  gradient?: string;
  hoverColor?: string;
  leftIcon?: string;
  rightIcon?: string;
  text?: string;
  subtitle?: string;
  textColor?: string;
  width?: string; // > editable
  minWidth?: string; // > editable
  minHeight?: string; // > editable
  disabled?: boolean;
  fontSize?: string; // > editable
  fontWeight?: string; // > editable
  leftImageWidth?: string; // > editable
  leftImageHeight?: string; // > editable
  cursor?: string;
  cornerRadius?: string;
  padding?: string;
  textWidth?: string;
  whiteSpace?: string;
  buttonLink?: string; // needs for the links so that don't brake an existing markup and the entire button is clickable
  linkType?: string; // _blank or _self
  download?: boolean;
  documentType?: string; // can be pdf or xslx/csv
}

