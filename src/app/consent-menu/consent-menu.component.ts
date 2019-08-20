import {Component, Inject, ElementRef, OnInit, HostListener} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef  } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import {DataService} from '../services/data-service';
import {DarkThemeSwitch} from '../dark-theme-switch';


export type optionsView = 'inline' | 'button';

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
  optionsView: optionsView = 'inline';
  ConsentText: string;
  ConsentYesText: string;
  ConsentNoText: string;
  ConsentButtonColor: string;

  isSort = false;
  sortMode;

  @HostListener('window:resize', ['$event.target'])
    onResize() {
      this.updatePosition();
    }

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any[],
      _matDialogRef: MatDialogRef<ConsentMenuComponent>,
      private sanitizer: DomSanitizer,
      private dataService: DataService,
      public darkTheme: DarkThemeSwitch
  ) {
    this.header = data['header'];
    this.options = data['options'];
    this.optionsView = data['optionsView'] || 'inline';
    this.isSort = data['isSort'];
    this.sortMode = data['sortMode'] || 'expiration_time';
    this._matDialogRef = _matDialogRef;

    this.triggerElementRef = data['trigger'];
    this.ConsentText = data['ConsentText'];
    this.ConsentYesText = data['ConsentYesText'];
    this.ConsentNoText = data['ConsentNoText'];
    this.ConsentButtonColor = data['ConsentButtonColor'];
  }

  ngOnInit() {
    this.updatePosition();
  }

  updatePosition() {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
      matDialogConfig.position = { left: `${rect.left + (rect.width / 2) - (275 / 2)}px`, top: `${rect.bottom + 15}px` };
      matDialogConfig.width = '275px';
      this._matDialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
      this._matDialogRef.updatePosition(matDialogConfig.position);
  }

  getColor(option) {
    return this.sanitizer.bypassSecurityTrustStyle(option.color);
  }

  getConcentButtonColor(color) {
      return this.sanitizer.bypassSecurityTrustStyle(color);
  }

  onNoClick(): void {
      this._matDialogRef.close();
  }
}
