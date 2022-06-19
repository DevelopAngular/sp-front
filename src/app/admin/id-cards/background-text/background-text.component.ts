import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-background-text',
  templateUrl: './background-text.component.html',
  styleUrls: ['./background-text.component.scss']
})
export class BackgroundTextComponent implements OnInit {

  public text: string = '';

  constructor(
    private dialogRef: MatDialogRef<BackgroundTextComponent>,
  ) { }

  ngOnInit(): void {
  }

}
