import { Component, OnInit } from '@angular/core';

import { combineLatest } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {

  private outletDummySwitcher$ = new BehaviorSubject<boolean>(false);

  public showDummySwitcher$: Observable<boolean>;

  constructor(private userService: UserService) {
    this.showDummySwitcher$ = combineLatest(this.userService.userData, this.outletDummySwitcher$, (u, d) => d || !u.isAdmin());
  }

  ngOnInit() {
  }

  hideOutlet(event: boolean) {
    this.outletDummySwitcher$.next(event);
  }

}
