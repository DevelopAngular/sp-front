import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-info-editor',
  templateUrl: './info-editor.component.html',
  styleUrls: ['./info-editor.component.scss']
})
export class InfoEditorComponent implements OnInit {

  type: string;
  dateTime: Date;
  message: string;

  constructor(public dialogRef: MatDialogRef<InfoEditorComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.type = this.data['type'];
    this.message = this.data['originalMessage'];
    this.dateTime = this.data['originalDate'];
  }

  closeDialog(data?){
    if(data)
      this.dialogRef.close(data);
    else
      this.dialogRef.close(this.type==='message'?this.message:this.dateTime);
  }
}
