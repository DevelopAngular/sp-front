import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {User} from '../../models/User';
import {Location} from '../../models/Location';
import {Router} from '@angular/router';
import {switchMap, tap} from 'rxjs/operators';
import {DataService} from '../../services/data-service';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-profile-card-dialog',
  templateUrl: './profile-card-dialog.component.html',
  styleUrls: ['./profile-card-dialog.component.scss']
})
export class ProfileCardDialogComponent implements OnInit {

  public profile: any;
  public teacherAssignedTo: Location[] = [];
  public testGroup = new FormGroup({
      test: new FormControl(true),
    }
  )
  public testControll = new FormControl(true);


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProfileCardDialogComponent>,
    private router: Router,
    private dataService: DataService
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.profile = this.data.profile;

    if (this.data.role === '_profile_teacher') {
        this.dataService.getLocationsWithTeacher(this.profile._originalUserProfile)
          .subscribe((locations: Location[]) => {
            this.teacherAssignedTo = locations;
          });
    }

  }
  goToSearch() {
    this.dialogRef.close();
    this.router.navigate(['admin/search'], {
      queryParams: {
        profileId: this.profile.id,
        profileName: this.profile['Name'],
        role: this.data.role
      }
    });
  }
  goToPassConfig(location: Location) {
    this.dialogRef.close();

    if (location) {
      this.router.navigate(['admin/passconfig'], {
        queryParams: {
          locationId: location.id,
        }
      });

    } else {
      this.router.navigate(['admin/passconfig']);
    }

  }

  back() {
    this.dialogRef.close();
  }
}
