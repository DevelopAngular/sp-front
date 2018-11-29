import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-input-helper-dialog',
  templateUrl: './input-helper-dialog.component.html',
  styleUrls: ['./input-helper-dialog.component.scss']
})
export class InputHelperDialogComponent implements OnInit {
  type: string;

  toDate: Date;
  fromDate: Date;

  selectedStudents: any[] = [];

  get headerText(){
    if(this.type == 'dates')
      return 'Date & Time Range';
    if(this.type == 'user')
      return 'Students';
    if(this.type == 'location')
      return 'Locations';
  }

  constructor(public dialogRef: MatDialogRef<InputHelperDialogComponent>,  @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.type = this.data['type'];
    this.toDate = this.data['to'];
    this.fromDate = this.data['from'];
    this.selectedStudents = this.data['selections']
  }

  closeDialog(event: any){
    if(this.type == 'dates')
      this.dialogRef.close({'from':this.fromDate, 'to':this.toDate, 'text':event})
    if(this.type == 'user'){
      let text: string = '';
      for(let s in this.selectedStudents)
        text += this.selectedStudents[s]['display_name'].toString() +', ';
      text = text.substring(0, text.length-2);
      console.log(this.selectedStudents)
      this.dialogRef.close({'selection':this.selectedStudents, 'text': text});
    }
  }
}