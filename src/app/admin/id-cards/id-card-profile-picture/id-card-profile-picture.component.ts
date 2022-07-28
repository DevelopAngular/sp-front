import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { merge, of, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-id-card-profile-picture',
  template: `<app-profile-picture [page]="isUploadedProfilePictures ? 5 : 2" (backEmit)="dialogRef.close()"></app-profile-picture>`,
  styleUrls: ['./id-card-profile-picture.component.scss']
})
export class IdCardProfilePictureComponent implements OnInit {

  isUploadedProfilePictures: boolean;
  destroy$ = new Subject();

  constructor(
    public dialogRef: MatDialogRef<IdCardProfilePictureComponent>,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    merge(of(this.userService.getUserSchool()), this.userService.getCurrentUpdatedSchool$().pipe(filter(s => !!s)))
        .pipe(takeUntil(this.destroy$))
        .subscribe(school => {
          this.isUploadedProfilePictures = school.profile_pictures_completed;
        });
  }

}
