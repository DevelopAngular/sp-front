import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-idcard-overlay-container',
  templateUrl: './idcard-overlay-container.component.html',
  styleUrls: ['./idcard-overlay-container.component.scss']
})
export class IdcardOverlayContainerComponent implements OnInit {

  IDCARDDETAILS: any;

  constructor(
    public dialogRef: MatDialogRef<IdcardOverlayContainerComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) { }

  ngOnInit(): void {
    this.IDCARDDETAILS = this.dialogData.idCardData
  }

}
