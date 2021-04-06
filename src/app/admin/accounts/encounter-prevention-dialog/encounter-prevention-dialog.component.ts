import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-encounter-prevention-dialog',
  templateUrl: './encounter-prevention-dialog.component.html',
  styleUrls: ['./encounter-prevention-dialog.component.scss']
})
export class EncounterPreventionDialogComponent implements OnInit {

  page: number = 1;

  constructor(private dialogRef: MatDialogRef<EncounterPreventionDialogComponent>) { }

  ngOnInit(): void {
  }

  nextPage() {
    setTimeout(() => {
      this.page += 1;
    }, 100);
  }

  back() {
    if (this.page === 1) {
      this.dialogRef.close();
    } else {
      setTimeout(() => {
        this.page -= 1;
      }, 100);
    }
  }

}
