import { Component, Inject, ElementRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef  } from '@angular/material';

@Component({
  selector: 'app-consent-menu',
  templateUrl: './consent-menu.component.html',
  styleUrls: ['./consent-menu.component.scss']
})
export class ConsentMenuComponent {

  _matDialogRef: MatDialogRef<ConsentMenuComponent>;
  triggerElementRef: ElementRef;

  header: string;
  confirm: string;
  deny: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any[], _matDialogRef: MatDialogRef<ConsentMenuComponent>) {
    this.header = data['header'];
    this.confirm = data['confirm'];
    this.deny = data['deny'];
    this._matDialogRef = _matDialogRef;
    this.triggerElementRef = data['trigger'];
  }

  ngOnInit(){
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left - 86}px`, top: `${rect.bottom + 15}px` };
    matDialogConfig.width = '194px';
    matDialogConfig.height = '100px';
    this._matDialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
    this._matDialogRef.updatePosition(matDialogConfig.position);
  }
}