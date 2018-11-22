import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {GSuiteDialogComponent} from '../dialogs/g-suite-dialog/g-suite-dialog.component';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  constructor(
    public matDialog: MatDialog,
) {}

  ngOnInit() {

  }
  openGSuiteDialog() {
    const DR = this.matDialog.open(GSuiteDialogComponent,
                            {
                              width: '768px', height: '560px',
                              panelClass: 'accounts-profiles-dialog',
                              backdropClass: 'custom-bd'
                            });
          // DR.afterClosed().subscribe((v) => { console.log(v); });
  }

}
