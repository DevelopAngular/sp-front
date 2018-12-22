import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface LinkGeneratedDialogData {
  name: string;
  link: string;
}

@Component({
  selector: 'app-link-generated-dialog',
  templateUrl: './link-generated-dialog.component.html',
  styleUrls: ['./link-generated-dialog.component.scss']
})
export class LinkGeneratedDialogComponent implements OnInit {

  name: string;
  link: string | SafeUrl;

  static createDialog(dialog: MatDialog, name: string, link: string) {
    return dialog.open(LinkGeneratedDialogComponent, {data: {name, link}});
  }

  constructor(private sanitizer: DomSanitizer, @Inject(MAT_DIALOG_DATA) public data: LinkGeneratedDialogData) {
    this.name = data.name;
    this.link = this.sanitizer.bypassSecurityTrustUrl(data.link);
    ;
  }

  ngOnInit() {
  }

}
