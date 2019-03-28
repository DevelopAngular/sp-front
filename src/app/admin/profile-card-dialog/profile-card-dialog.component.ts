import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {User} from '../../models/User';
import {Location} from '../../models/Location';
import {Router} from '@angular/router';
import {switchMap, tap} from 'rxjs/operators';
import {DataService} from '../../services/data-service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable, of, zip} from 'rxjs';
import {UserService} from '../../services/user.service';
import {ConsentMenuComponent} from '../../consent-menu/consent-menu.component';
import {HttpService} from '../../services/http-service';

import * as _ from 'lodash';

@Component({
  selector: 'app-profile-card-dialog',
  templateUrl: './profile-card-dialog.component.html',
  styleUrls: ['./profile-card-dialog.component.scss']
})
export class ProfileCardDialogComponent implements OnInit {

  public profile: any;
  public teacherAssignedTo: Location[] = [];
  public permissionsForm: FormGroup;
  public permissionsFormEditState: boolean = false;
  public controlsIteratable: any[];
  public permissionsChanged: boolean = false;
  public disabledState: boolean = false;
  public headerText: string = '';
  public consentMenuOpened: boolean = false;
  public headerIcon: string;
  public layout: string = 'viewProfile';
  private initialState;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProfileCardDialogComponent>,
    private matDialog: MatDialog,
    private router: Router,
    private dataService: DataService,
    private userService: UserService,
    private http: HttpService
  ) { }

  ngOnInit() {

    console.log(this.data);

    if (this.data.gSuiteSettings) {
      this.layout = 'gSuiteSettings';
      this.headerIcon = './assets/google/google_logo.svg';
    }
    if (this.data.bulkPermissions) {
      this.layout = 'bulkPermissions';

    }
    if (this.data.profile) {

      this.profile = this.data.profile;
      this.headerIcon = `./assets/${
                          this.data.role === '_profile_admin'
                          ?
                          'Admin'
                          :
                          this.data.role === '_profile_teacher'
                          ?
                          'Teacher'
                          :
                          'Student'} (Navy).svg`;
    }

    this.headerText = this.data.bulkPermissions
                      ?
                      this.data.bulkPermissions.length + ` user${this.data.bulkPermissions.length > 1 ? 's' : ''} selected`
                      :
                      this.profile
                      ?
                      this.profile['Name']
                      :
                      'Settings';

    if (this.data.role === '_profile_teacher') {
        this.dataService.getLocationsWithTeacher(this.profile._originalUserProfile)
          .subscribe((locations: Location[]) => {
            this.teacherAssignedTo = locations;
          });
    }

    if (this.data.role !== '_profile_student' && this.data.role !== '_all') {
      const permissions = this.data.permissions;
      this.controlsIteratable = Object.values(permissions);
      const group: any = {};
      for (const key in permissions) {
        const value = (this.profile._originalUserProfile as User).roles.includes(key);
        console.log(value);
        group[key] = new FormControl(value);
      }
      this.permissionsForm = new FormGroup(group);
      this.initialState = _.cloneDeep(this.permissionsForm.value);
      this.permissionsForm.valueChanges.subscribe((formValue) => {
        this.permissionsFormEditState = !_.isEqual(Object.values(this.initialState), Object.values(formValue));

      });
    }


    // this.testGroup.valueChanges.subscribe((v) => {
    //   console.log('test Group ==>', v);
    //   this.permissionsChanged = true;
    // });
    this.dialogRef.backdropClick().subscribe(() => {
      this.back();
    });
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


    // this.dialogRef.close();

    if (location) {
      // this.router.navigate(['admin/passconfig'], {
      //   queryParams: {
      //     locationId: location.id,
      //   }
      // });
      window.open(`admin/passconfig?locationId=${location.id}`);

    } else {
      this.router.navigate(['admin/passconfig']);
    }

  }

  updateProfilePermissions() {

    this.disabledState = true;

    if ( this.data.bulkPermissions) {
      zip(...this.data.bulkPermissions.map((userId) => this.userService.createUserRoles(userId, this.permissionsForm.value)))
        .subscribe((result) => {
          console.log(result);
          this.disabledState = false;
          this.permissionsChanged = true;
          this.permissionsFormEditState = false;
        });

    }

    this.userService
      .createUserRoles(this.profile.id, this.permissionsForm.value)
      .subscribe((result) => {
        console.log(result);
        this.disabledState = false;
        this.permissionsChanged = true;
        this.permissionsFormEditState = false;
      });

  }

  deleteAccount(eventTarget: HTMLElement) {
      this.consentMenuOpened = true;
      const DR = this.matDialog.open(ConsentMenuComponent,
        {
          data: {
            role: this.data.role,
            selectedUsers: this.data.profile,
            alignSelf: true,
            header: `Are you sure you want to remove this user?`,
            // options: [{display: 'Confirm Remove', color: '#FFFFFF', buttonColor: '#DA2370, #FB434A', action: 'confirm'}],
            options: [{display: 'Confirm Delete', color: '#DA2370', buttonColor: '#DA2370, #FB434A', action: 'confirm'}],
            // optionsView: 'button',
            trigger: new ElementRef(eventTarget)
          },
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
        });
      DR.afterClosed()
        .pipe(
          switchMap((action): Observable<any> => {
            // console.log(action);
            this.consentMenuOpened = false;
            // if (action === 'confirm') {
            //   let role: any = this.data.role.split('_');
            //   role = role[role.length - 1];
            //   return this.userService.deleteUserFromProfile(this.profile.id, role);
            // } else {
            //   return of(null);
            // }
              return of(null);

          }),
        )
        .subscribe((res) => {
          console.log(res);
          if (res != null) {
            this.http.setSchool(this.http.getSchool());
          }
        });

  }

  back() {
    this.dialogRef.close(this.permissionsChanged);
  }
}
