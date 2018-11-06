import { Component, Inject, ElementRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef  } from '@angular/material';
import { DomSanitizer } from '../../../node_modules/@angular/platform-browser';
import {DataService} from '../data-service';

@Component({
  selector: 'app-consent-menu',
  templateUrl: './consent-menu.component.html',
  styleUrls: ['./consent-menu.component.scss']
})
export class ConsentMenuComponent implements OnInit {

  _matDialogRef: MatDialogRef<ConsentMenuComponent>;
  triggerElementRef: ElementRef;

  header: string;
  options: any[];

  isSort = false;

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any[],
      _matDialogRef: MatDialogRef<ConsentMenuComponent>,
      private sanitizer: DomSanitizer,
      private dataService: DataService,
  ) {
    this.header = data['header'];
    this.options = data['options'];

    this._matDialogRef = _matDialogRef;

    console.log(this._matDialogRef);

    this.triggerElementRef = data['trigger'];
    if (this.data['isSort']) {
      this.isSort = true;
    }
  }

  ngOnInit() {
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

  checkOption(opt) {
    this.options.forEach(option => {
      option.toggle = false;
    });
    opt.toggle = !opt.toggle;
    this.dataService.sort$.next(opt.action);
  }
}
