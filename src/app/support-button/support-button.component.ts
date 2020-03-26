import { Component, ElementRef, OnInit } from '@angular/core';
import { SupportOptionsComponent } from '../support-options/support-options.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-support-button',
  templateUrl: './support-button.component.html',
  styleUrls: ['./support-button.component.scss']
})
export class SupportButtonComponent implements OnInit {

  isOpenOptions: boolean;

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  openSupportOptions(event) {
    if (!this.isOpenOptions) {
      this.isOpenOptions = true;
      const SPO = this.dialog.open(SupportOptionsComponent, {
        id: 'support',
        hasBackdrop: false,
        panelClass: 'toasr',
        data: { trigger: new ElementRef(event.currentTarget) }
      });

      SPO.beforeClosed().subscribe(() => {
        this.isOpenOptions = false;
      });
    } else {
      this.dialog.getDialogById('support').close();
    }
  }

}
