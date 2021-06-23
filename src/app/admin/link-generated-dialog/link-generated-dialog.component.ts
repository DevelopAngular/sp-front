import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {XlsxService} from '../../services/xlsx.service';

export interface LinkGeneratedDialogData {
  name: string;
  selectedReports: any[];
  pdfLink: string;
}

@Component({
  selector: 'app-link-generated-dialog',
  templateUrl: './link-generated-dialog.component.html',
  styleUrls: ['./link-generated-dialog.component.scss']
})
export class LinkGeneratedDialogComponent implements OnInit {

  name: string;

  pdflink: string | SafeUrl;

  static createDialog(dialog: MatDialog, name: string, pdfLink: string, selectedReports?: any) {
    return dialog.open(LinkGeneratedDialogComponent, {
      panelClass: 'accounts-profiles-dialog',
      backdropClass: 'custom-bd',
      data: {name, pdfLink, selectedReports }
    });
  }

  constructor(
      private sanitizer: DomSanitizer,
      @Inject(MAT_DIALOG_DATA) public data: LinkGeneratedDialogData,
      public dialogRef: MatDialogRef<LinkGeneratedDialogComponent>,
      public xlsx: XlsxService
      ) {
    this.name = data.name;
    this.pdflink = this.sanitizer.bypassSecurityTrustUrl(data.pdfLink);
    console.log('Link ===>>>>', this.pdflink);
  }

  ngOnInit() {
  }

  downloadXlsxFile() {
    this.xlsx.generate(this.data.selectedReports);
  }

}
