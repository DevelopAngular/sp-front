import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {User} from '../../../models/User';

enum Pages {
  'startPage' = 0,
  'newGroup'= 1,
  'editGroup' = 2
}

export interface EncountersState {
  prevent_page: number;
  current_page: number;
  data: {
    students: User[],
    teachers: User[],
    group_name: string,
    notes: string
  };
}

@Component({
  selector: 'app-encounter-prevention-dialog',
  templateUrl: './encounter-prevention-dialog.component.html',
  styleUrls: ['./encounter-prevention-dialog.component.scss']
})
export class EncounterPreventionDialogComponent implements OnInit {

  state: EncountersState = {
    prevent_page: 0,
    current_page: 0,
    data: {
      students: [],
      teachers: [],
      group_name: '',
      notes: ''
    }
  };

  constructor(private dialogRef: MatDialogRef<EncounterPreventionDialogComponent>) { }

  ngOnInit(): void {
  }

  setState(prevent_page, current_page) {
    this.state = {
      ...this.state,
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
    if (this.state.current_page === Pages.newGroup) {
      this.nextPage();
    }
  }
}
