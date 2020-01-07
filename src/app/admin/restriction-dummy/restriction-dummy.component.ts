import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-restriction-dummy',
  templateUrl: './restriction-dummy.component.html',
  styleUrls: ['./restriction-dummy.component.scss']
})
export class RestrictionDummyComponent implements OnInit {

  @Output() reloadPage: EventEmitter<boolean> = new EventEmitter<boolean>();

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
          const availableAccessTo = user.roles.filter((_role) => _role.match('admin_'));
          let tab;
          if (availableAccessTo.includes('admin_dashboard')) {
            tab = 'dasboard';
          } else if (availableAccessTo.includes('admin_hallmonitor')) {
            tab = 'hallmonitor';
          } else if (availableAccessTo.includes('admin_search')) {
            tab = 'search';
          } else if (availableAccessTo.includes('admin_pass_config')) {
            tab = 'passconfig';
          } else if (availableAccessTo.includes('admin_accounts')) {
            tab = 'accounts';
          }
          this.reloadPage.emit(true);
          this.router.navigate(['/admin', tab]);
          return;
        }
      }

      this.router.navigate(['/sign-out']);
    });
  }
}
