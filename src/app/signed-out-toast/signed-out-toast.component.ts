import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'app-signed-out-toast',
  templateUrl: './signed-out-toast.component.html',
  styleUrls: ['./signed-out-toast.component.scss']
})
export class SignedOutToastComponent implements OnInit {

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<SignedOutToastComponent>
  ) { }

  ngOnInit() {

  }
  signBackIn() {
    this.router.navigate(['sign-out']);
    this.dialogRef.close();
  }
}
