import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {FeedbackWindowComponent} from './feedback-window/feedback-window.component';

@Component({
  selector: 'app-feedback-button',
  templateUrl: './feedback-button.component.html',
  styleUrls: ['./feedback-button.component.scss']
})
export class FeedbackButtonComponent implements OnInit {

  @Input() buttonColor: string = '#FFFFFF';

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  buttonClick(event) {
    this.dialog.open(FeedbackWindowComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {target: event.currentTarget}
    });
  }

}
