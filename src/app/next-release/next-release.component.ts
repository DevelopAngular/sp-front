import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserService} from '../services/user.service';
import {NextReleaseService} from './services/next-release.service';
import {MobileDeviceService} from '../services/mobile-device.service';
import {DeviceDetection} from '../device-detection.helper';
import {filter, map, switchMap} from 'rxjs/operators';
import {User} from '../models/User';
import {zip} from 'rxjs';

export interface Update {
  id: number; // 136
  airtable_id: string; // "receM1Ajf3Y9lqk44"
  name: string; // "Dhruv is a boss"
  on_off: boolean; // false
  on_off_staging: boolean; // true
  description: string; // "Dhruv OS received a version upgrade last night"
  link: string; // "https://www.github.com/dsringari"
  update_type: 'enhancement' | 'feature' | 'bug_fix';  // "enhancement"
  date_launched: string; // "2020-02-10T00:00:00Z"
  platforms: Array<'ios' | 'web' | 'android'>; // (2) ["ios", "web"]
  ios_version: string; // "1.8"
  internal_comments: string; // "Something, goes here!"
  created: string; // "2020-02-11T02:24:02Z"
  groups: Array<'student' | 'teacher' | 'assistant' | 'admin'>; // (4) ["student" | "teacher", "assistant", "admin"]
}


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
    private userService: UserService,
    private nextReleaseService: NextReleaseService
  ) { }

  itemBackgroundColor(item: Update) {
    switch (item.update_type) {
      case 'bug_fix': return '#E32C66';
      case 'enhancement': return '#139BE6';
      case 'feature': return '#00B476';
    }
  }

  ngOnInit() {
    this.whatsNewItems = this.data.releaseUpdates;
  }

  onScroll(event) {
    if (event.target.scrollTop >= 104) {
      this.stickHeader.nativeElement.style.boxShadow = '0px 1px 10px 0px rgba(0, 0, 0, .10)';
      this.stickHeader.nativeElement.style.fontSize = '17px';
    } else {
      this.stickHeader.nativeElement.style.boxShadow = '0px 1px 10px 0px rgba(0, 0, 0, 0)';
      this.stickHeader.nativeElement.style.fontSize = '28px';
    }
  }

  markAsSeen() {
    this.dialogRef.close();
  }
}
