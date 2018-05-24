import { Component, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-consent-menu',
  templateUrl: './consent-menu.component.html',
  styleUrls: ['./consent-menu.component.css']
})
export class ConsentMenuComponent {

  content: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any[]) {
    this.content = data['content'];
  }

}
