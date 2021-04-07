import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

enum Pages {
  'startPage' = 0,
  'newGroup'= 1,
  'editGroup' = 2
}

@Component({
  selector: 'app-encounter-prevention-dialog',
  templateUrl: './encounter-prevention-dialog.component.html',
  styleUrls: ['./encounter-prevention-dialog.component.scss']
})
export class EncounterPreventionDialogComponent implements OnInit {

  state: {
    prevent_page: number,
    current_page: number
  } = {
    prevent_page: 0,
    current_page: 0
  };

  constructor(private dialogRef: MatDialogRef<EncounterPreventionDialogComponent>) { }

  ngOnInit(): void {
  }

  setState(prevent_page, current_page) {
    this.state = {
      prevent_page,
      current_page
    };
  }

  nextPage() {
    setTimeout(() => {
      this.setState(this.state.current_page, this.state.current_page + 1);
    }, 100);
  }

  back() {
    if (this.state.current_page === Pages.startPage) {
      this.dialogRef.close();
    } else {
      setTimeout(() => {
        this.setState(this.state.current_page - 1, this.state.prevent_page);
      }, 100);
    }
  }

  save() {
    debugger;
    if (this.state.current_page === Pages.newGroup) {
      this.nextPage();
    }
  }
}
