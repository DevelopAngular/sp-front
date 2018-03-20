import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-pass-info',
  templateUrl: './pass-info.component.html',
  styleUrls: ['./pass-info.component.css']
})
export class PassInfoComponent implements OnInit {
  id;
  constructor(
    public dialogRef: MatDialogRef<PassInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(){
    this.id = this.data['id'];
    console.log("Dialog open and received data: " +this.id);
    console.log(this.id);
  }

}
