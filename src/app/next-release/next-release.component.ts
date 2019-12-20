import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-next-release',
  templateUrl: './next-release.component.html',
  styleUrls: ['./next-release.component.scss']
})
export class NextReleaseComponent implements OnInit {
  @ViewChild('stickHeader') stickHeader: ElementRef<any>;

  public releaseIndex;
  public whatsNewItems;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<NextReleaseComponent>,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.userService
      .user$
      .subscribe((user) => {
        this.releaseIndex = '1.2'
        this.whatsNewItems = [
            // {
            //   title: 'Pass Creation Redesign',
            //   description: 'Making passes on web is simpler and cleaner',
            //   icon: './assets/nextReleaseIcons/tools.svg',
            //   visible: this.data['isStudent'] || this.data['isTeacher']
            // },
            {
              updateName: 'Student Groups',
              updateType: 'Feature',
              updateColor: '#00B476',
              link: 'learn more...',
              updateLaunchDate: new Date(),
              description: 'Quickly send passes to a group of students in one tap. Create and configure groups on the web.',
            },
            {
              updateName: 'Standard Accounts',
              updateType: 'Enhancement',
              updateColor: '#139BE6',
              link: 'learn more...',
              updateLaunchDate: new Date(),
              description: 'Add accounts to your SmartPass account that aren\'t part of your G Suite. Create a username/password and sign in.',
            },
            {
              updateName: 'Fixed issue with making passes for future with students',
              updateType: 'Bug Fix',
              updateColor: '#E32C66',
              link: 'learn more...',
              updateLaunchDate: new Date(),
              description: 'Add accounts to your SmartPass account that aren\'t part of your G Suite. Create a username/password and sign in.',
            },
            // {
            //   title: 'Bug Fixes & Tweaks',
            //   description: 'Kills 99.99% of germs',
            //   icon: './assets/nextReleaseIcons/bug.svg',
            //   visible: this.data['isStudent'] || this.data['isTeacher']
            // }
          ];
      });
  }
  onScroll(event) {
    if (event.target.scrollTop >= 104) {
      this.stickHeader.nativeElement.style.boxShadow = '0px 1px 10px 0px rgba(0, 0, 0, .10)';
    } else {
      this.stickHeader.nativeElement.style.boxShadow = '0px 1px 10px 0px rgba(0, 0, 0, 0)';
    }
  }
  markAsSeen() {
    this.dialogRef.close();
  }
}
