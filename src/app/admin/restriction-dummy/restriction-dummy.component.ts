import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-restriction-dummy',
  templateUrl: './restriction-dummy.component.html',
  styleUrls: ['./restriction-dummy.component.scss']
})
export class RestrictionDummyComponent implements OnInit {

  constructor(
    private router: Router,
    private userService: UserService
  ) {
  }

  ngOnInit() {
  }

  goHome() {
    this.userService.getUserWithTimeout().subscribe(user => {
      if (user) {
        if (user.isStudent() || user.isTeacher()) {
          this.router.navigate(['/main']);
          return;
        }

        if (user.isAdmin()) {
          this.router.navigate(['/admin']);
          return;
        }
      }

      this.router.navigate(['/sign-out']);
    });


  }
}
