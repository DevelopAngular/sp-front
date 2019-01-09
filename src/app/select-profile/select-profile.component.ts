import {Component,  OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../models/User';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-select-profile',
  templateUrl: './select-profile.component.html',
  styleUrls: ['./select-profile.component.scss']
})
export class SelectProfileComponent implements OnInit {

  public stayHere$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public currentUser: User;
  public availableProfiles: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {

    this.route.data.subscribe((_resolved: any) => {
      this.currentUser = _resolved.currentUser;

      const userRoles = {
        admin: {
          value: this.currentUser.isAdmin(),
          redirectPath: 'admin',
          icon: './assets/Gear (Blue).png',
          title: 'Administrator',
        },
        teacher: {
          value: this.currentUser.isTeacher(),
          redirectPath: 'main',
          icon: './assets/My Room (Blue).png',
          title: 'Teacher'
        },
        student: {
          value: this.currentUser.isStudent(),
          redirectPath: 'main',
          icon: './assets/Hallway (Blue).png',
          title: 'Student'
        }
      };

      for (const key in userRoles) {
        if (userRoles[key].value ) {
          this.availableProfiles.push(userRoles[key]);
        }
      }

      if (this.availableProfiles.length === 1) {

        this.router.navigate([this.availableProfiles[0].redirectPath]);

      } else {

        this.stayHere$.next(true);
      }
    });
  }

  switchTo(account) {
    this.router.navigate([account]);
  }
  signOut() {
    this.router.navigate(['sign-out']);
  }
}