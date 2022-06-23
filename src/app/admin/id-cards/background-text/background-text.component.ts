import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-background-text',
  templateUrl: './background-text.component.html',
  styleUrls: ['./background-text.component.scss']
})
export class BackgroundTextComponent {

  public text: string = '';

  constructor(
    public dialogRef: MatDialogRef<BackgroundTextComponent>,
  ) { }

}
