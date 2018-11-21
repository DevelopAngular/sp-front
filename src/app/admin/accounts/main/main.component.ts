import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {GSuiteDialogComponent} from '../g-suite-dialog/g-suite-dialog.component';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  constructor(
    public matDialog: MatDialog,
    // public md: GSuiteDialogComponent
) {}

  ngOnInit() {
  }
  openGSuiteDialog() {
    const DR = this.matDialog.open(GSuiteDialogComponent, {ariaDescribedBy: '#g-suite', width: '768px', height: '560px', panelClass: 'accounts-profiles-dialog'});
          DR.afterClosed().subscribe((v) => { console.log(v); });
  }

}
