import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-consent-menu',
  templateUrl: './consent-menu.component.html',
  styleUrls: ['./consent-menu.component.css']
})
export class ConsentMenuComponent implements OnInit {

  content: string;

  constructor(public dialogRef: MatDialogRef<ConsentMenuComponent>, @Inject(MAT_DIALOG_DATA) public data: any[]) {
    this.content = data['content'];
  }

  ngOnInit() {

  }

  click(val){
    // if(val)
    //   this.onAccept.emit(true);
    // else
    //   this.onDecline.emit(false);
  }
}
