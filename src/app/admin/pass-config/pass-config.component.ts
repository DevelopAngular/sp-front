import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import {OverlayContainerComponent} from '../overlay-container/overlay-container.component';

@Component({
  selector: 'app-pass-congif',
  templateUrl: './pass-config.component.html',
  styleUrls: ['./pass-config.component.scss']
})
export class PassConfigComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  newRoom(ev) {
    this.dialog.open(OverlayContainerComponent, {
      panelClass: 'form-dialog-container',
      width: '1000px',
      height: '700px'
    });
  }

}
