import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-next-release',
  templateUrl: './next-release.component.html',
  styleUrls: ['./next-release.component.scss']
})
export class NextReleaseComponent implements OnInit {

  public releaseIndex;
  public whatsNewItems;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<NextReleaseComponent>,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.userService
      .getUserWithTimeout()
      .subscribe((user) => {
        this.releaseIndex = '1.2'
        this.whatsNewItems = [
            {
              title: 'Pass Creation Redesign',
              description: 'Making passes on web is simpler and cleaner',
              icon: './assets/nextReleaseIcons/tools.svg',
              visible: this.data['isStudent'] || this.data['isTeacher']
            },
            {
              title: 'Student Groups',
              description: 'Quickly send passes to a group of students in one tap',
              icon: './assets/nextReleaseIcons/users.svg',
              visible: this.data['isTeacher']
            },
            {
              title: 'Bug Fixes & Tweaks',
              description: 'Kills 99.99% of germs',
              icon: './assets/nextReleaseIcons/bug.svg',
              visible: this.data['isStudent'] || this.data['isTeacher']
            }
          ];
      });
  }
  markAsSeen() {
    this.dialogRef.close();
  }
}
