import { Component, Inject, ElementRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef  } from '@angular/material';
import { DomSanitizer } from '../../../node_modules/@angular/platform-browser';

@Component({
  selector: 'app-consent-menu',
  templateUrl: './consent-menu.component.html',
  styleUrls: ['./consent-menu.component.scss']
})
export class ConsentMenuComponent {

  _matDialogRef: MatDialogRef<ConsentMenuComponent>;
  triggerElementRef: ElementRef;

  header: string;
  options: any[];
  ConsentText: string;
  ConsentYesText: string;
  ConsentNoText: string;
  ConsentButtonColor: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any[], _matDialogRef: MatDialogRef<ConsentMenuComponent>, private sanitizer: DomSanitizer) {
    this.header = data['header'];
    this.options = data['options'];
    this._matDialogRef = _matDialogRef;
    this.triggerElementRef = data['trigger'];
    this.ConsentText = data['ConsentText'];
    this.ConsentYesText = data['ConsentYesText'];
    this.ConsentNoText = data['ConsentNoText'];
    this.ConsentButtonColor = data['ConsentButtonColor'];
  }

  ngOnInit(){
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left - 122}px`, top: `${rect.bottom + 15}px` };
    matDialogConfig.width = '275px';
    this._matDialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
    this._matDialogRef.updatePosition(matDialogConfig.position);
  }

  getColor(option){
    return this.sanitizer.bypassSecurityTrustStyle(option.color);
  }

  getConcentButtonColor(color) {
      return this.sanitizer.bypassSecurityTrustStyle(color);
  }

  onNoClick(): void {
      this._matDialogRef.close();
  }

}