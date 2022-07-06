import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IDCard } from '../admin/id-cards/id-card-editor/id-card-editor.component';

@Component({
  selector: 'app-idcard-overlay-container',
  templateUrl: './idcard-overlay-container.component.html',
  styleUrls: ['./idcard-overlay-container.component.scss']
})
export class IdcardOverlayContainerComponent implements OnInit {



  constructor(
    public dialogRef: MatDialogRef<IdcardOverlayContainerComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: IDCard,
  ) { }

  ngOnInit(): void {
  }

}
