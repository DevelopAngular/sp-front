import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {User} from '../../models/User';
import {Router} from '@angular/router';

@Component({
  selector: 'app-profile-card-dialog',
  templateUrl: './profile-card-dialog.component.html',
  styleUrls: ['./profile-card-dialog.component.scss']
})
export class ProfileCardDialogComponent implements OnInit {

  public profile: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProfileCardDialogComponent>,
    private routrer: Router
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.profile = this.data.profile;
  }
  goToSearch() {
    console.log('ok');
    this.dialogRef.close();
    this.routrer.navigate(['admin/search'], {
      queryParams: {
        profileId: this.profile.id,
        profileName: this.profile['Name'],
        role: this.data.role
      }
    });

    // switch (this.data.role) {
    //   case '_profile_student':
    //     this.routrer.navigate(['admin/search'], { queryParams: {studentId: this.profile.id, studentName: this.profile['Name']}});
    //     break;
    //   case '_profile_teacher':
    //     this.routrer.navigate(['admin/search'], { queryParams: {studentId: this.profile.id, studentName: this.profile['Name']}});
    //     break;
    // }

  }
  back() {
    this.dialogRef.close();
  }
}
