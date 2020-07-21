import { Component, ElementRef, OnInit } from '@angular/core';
import { SupportOptionsComponent } from '../support-options/support-options.component';
import { MatDialog } from '@angular/material';

declare const window;

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
    const chat = document.querySelector('#hubspot-messages-iframe-container');
    if (!this.isOpenOptions) {
      this.isOpenOptions = true;
      const SPO = this.dialog.open(SupportOptionsComponent, {
        id: 'support',
        backdropClass: 'invis-backdrop',
        panelClass: 'consent-dialog-container',
        data: { trigger: new ElementRef(event.currentTarget) }
      });

      SPO.afterClosed().subscribe((res) => {
          this.isOpenOptions = res;
      });
    } else {
      this.isOpenOptions = false;
      window.HubSpotConversations.widget.close();
      (chat as HTMLElement).setAttribute('style', 'opacity: 0 !important');
      if (this.dialog.getDialogById('support')) {
        this.dialog.getDialogById('support').close();
      }
    }
  }

}
