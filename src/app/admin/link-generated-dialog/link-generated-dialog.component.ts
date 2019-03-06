import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface LinkGeneratedDialogData {
  name: string;
  xlsxLink: string;
  pdfLink: string;
}

@Component({
  selector: 'app-link-generated-dialog',
  templateUrl: './link-generated-dialog.component.html',
  styleUrls: ['./link-generated-dialog.component.scss']
})
export class LinkGeneratedDialogComponent implements OnInit {

  name: string;
  XLSXlink: string | SafeUrl;
  PDFlink: string | SafeUrl;

  static createDialog(dialog: MatDialog, name: string, xlsxLink: string, pdfLink: string) {
    return dialog.open(LinkGeneratedDialogComponent, {
      panelClass: 'accounts-profiles-dialog',
      backdropClass: 'custom-bd',
      data: {name, xlsxLink, pdfLink }
    });
  }

  constructor(
      private sanitizer: DomSanitizer,
      @Inject(MAT_DIALOG_DATA) public data: LinkGeneratedDialogData,
      public dialogRef: MatDialogRef<LinkGeneratedDialogComponent>,
      ) {
    this.name = data.name;
    this.XLSXlink = this.sanitizer.bypassSecurityTrustUrl(data.xlsxLink);
    this.PDFlink = this.sanitizer.bypassSecurityTrustUrl(data.pdfLink);
  }

  ngOnInit() {
  }

}
