import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';

@Component({
  selector: 'app-no-account',
  templateUrl: './no-account.component.html',
  styleUrls: ['./no-account.component.scss']
})
export class NoAccountComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<NoAccountComponent>,
    private router: Router
  ) { }

  ngOnInit() {

  }
  schoolSignup() {
    this.close();
    this.router.navigate(['school_signup'], {queryParams: {key: 'test'}});
  }
  close() {
    this.dialogRef.close();
  }
}
